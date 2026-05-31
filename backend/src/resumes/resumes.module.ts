import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from './entities/resume.entity';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Resume, FreelanceProfile])],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
