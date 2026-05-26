import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competence } from './entities/competence.entity';
import { FreelanceCompetence } from './entities/freelance-competence.entity';
import { CompetencesService } from './competences.service';
import { CompetencesController } from './competences.controller';
import { FreelanceCompetencesService } from './freelance-competences.service';
import { FreelanceCompetencesController } from './freelance-competences.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Competence, FreelanceCompetence])],
  controllers: [CompetencesController, FreelanceCompetencesController],
  providers: [CompetencesService, FreelanceCompetencesService],
  exports: [CompetencesService, FreelanceCompetencesService],
})
export class CompetencesModule {}
