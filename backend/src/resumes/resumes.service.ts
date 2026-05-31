import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { Resume } from './entities/resume.entity';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { CreateResumeDto } from './dto/create-resume.dto';

@Injectable()
export class ResumesService {
  constructor(
    @InjectRepository(Resume)
    private readonly repo: Repository<Resume>,
    @InjectRepository(FreelanceProfile)
    private readonly profileRepo: Repository<FreelanceProfile>,
  ) {}

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
    });

    return this.repo.save(resume);
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
      const diskPath = join(process.cwd(), 'uploads', 'resumes', fileName);
      await unlink(diskPath).catch(() => undefined);
    }

    await this.repo.delete(id);
  }
}
