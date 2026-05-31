import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from './entities/resume.entity';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { ResumeEmbeddingService } from './resume-embedding.service';

@Module({
  imports: [TypeOrmModule.forFeature([Resume, FreelanceProfile])],
  controllers: [ResumesController],
  providers: [ResumesService, ResumeEmbeddingService],
  exports: [ResumesService],
})
export class ResumesModule {}
