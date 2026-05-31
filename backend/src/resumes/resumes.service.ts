import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../users/entities/resume.entity';
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
}
