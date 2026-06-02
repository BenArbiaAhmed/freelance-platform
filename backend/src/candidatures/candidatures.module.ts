import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidature } from './entities/candidature.entity';
import { Contrat } from '../contrats/entities/contrat.entity';
import { Resume } from '../resumes/entities/resume.entity';
import { CandidaturesService } from './candidatures.service';
import { CandidaturesController } from './candidatures.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Candidature, Contrat, Resume])],
  controllers: [CandidaturesController],
  providers: [CandidaturesService],
  exports: [CandidaturesService],
})
export class CandidaturesModule {}
