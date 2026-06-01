import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { basename, join } from 'path';
import { unlink } from 'fs/promises';
import { Resume, ResumeStatus } from './entities/resume.entity';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ResumeEmbeddingService } from './resume-embedding.service';
import { ExtractionService } from '../matching/extraction/extraction.service';

const RESUME_DIR = join(process.cwd(), 'uploads', 'resumes');

@Injectable()
export class ResumesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ResumesService.name);

  constructor(
    @InjectRepository(Resume)
    private readonly repo: Repository<Resume>,
    @InjectRepository(FreelanceProfile)
    private readonly profileRepo: Repository<FreelanceProfile>,
    private readonly embeddingService: ResumeEmbeddingService,
    private readonly extraction: ExtractionService,
  ) {}

  /** On boot, re-run any resumes left mid-flight by a previous process. */
  async onApplicationBootstrap(): Promise<void> {
    const pending = await this.repo.find({
      where: { status: In([ResumeStatus.UPLOADED, ResumeStatus.EXTRACTING]) },
    });
    if (pending.length === 0) return;
    this.logger.log(`Reconciling ${pending.length} unprocessed resume(s)`);
    for (const resume of pending) {
      const filePath = join(RESUME_DIR, basename(resume.fileUrl));
      void this.processResume(resume.id, filePath, resume.mimeType);
    }
  }

  async create(
    file: Express.Multer.File,
    dto: CreateResumeDto,
    userId: string,
  ): Promise<Resume> {
    const profile = await this.profileRepo.findOne({
      where: { id: dto.freelanceProfileId },
    });
    if (!profile) {
      throw new NotFoundException(
        `FreelanceProfile ${dto.freelanceProfileId} not found`,
      );
    }
    if (profile.userId !== userId) {
      throw new ForbiddenException('Not allowed to upload for this profile');
    }

    const resume = this.repo.create({
      freelanceProfileId: profile.id,
      freelanceProfile: profile,
      fileName: file.originalname,
      fileUrl: `/uploads/resumes/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      status: ResumeStatus.UPLOADED,
    });

    const saved = await this.repo.save(resume);
    // Heavy work (text extraction + LLM parse + embedding) runs off the
    // request path; the client polls GET /resumes for the status to flip.
    if (file.path) {
      void this.processResume(saved.id, file.path, file.mimetype);
    }
    return saved;
  }

  /** UPLOADED → EXTRACTING → (extract text → LLM parse → READY + index) | FAILED. */
  async processResume(
    id: string,
    filePath: string,
    mimeType?: string | null,
  ): Promise<void> {
    await this.repo.update(id, { status: ResumeStatus.EXTRACTING });
    try {
      const text = await this.embeddingService.extractText(filePath, mimeType);
      if (!text || text.trim().length < 30) {
        throw new Error('No extractable text found in the document');
      }

      const extracted = await this.extraction.extract(text);
      await this.repo.update(id, {
        status: ResumeStatus.READY,
        extracted,
        extractionError: null,
      });

      const resume = await this.repo.findOne({ where: { id } });
      if (resume) {
        await this.embeddingService.indexResume(resume);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to process resume ${id}: ${message}`);
      await this.repo.update(id, {
        status: ResumeStatus.FAILED,
        extractionError: message.slice(0, 500),
      });
    }
  }

  async listForProfile(
    freelanceProfileId: string,
    userId: string,
  ): Promise<Resume[]> {
    const profile = await this.profileRepo.findOne({
      where: { id: freelanceProfileId },
    });
    if (!profile) {
      throw new NotFoundException(
        `FreelanceProfile ${freelanceProfileId} not found`,
      );
    }
    if (profile.userId !== userId) {
      throw new ForbiddenException('Not allowed to view this profile');
    }

    return this.repo.find({
      where: { freelanceProfileId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const resume = await this.repo.findOne({
      where: { id },
      relations: { freelanceProfile: true },
    });
    if (!resume) {
      throw new NotFoundException(`Resume ${id} not found`);
    }
    if (resume.freelanceProfile?.userId !== userId) {
      throw new ForbiddenException('Not allowed to delete this resume');
    }

    const fileName = resume.fileUrl.split('/').pop();
    if (fileName) {
      const diskPath = join(RESUME_DIR, fileName);
      await unlink(diskPath).catch(() => undefined);
    }

    await this.repo.delete(id);
    void this.embeddingService.deleteResume(id);
  }
}
