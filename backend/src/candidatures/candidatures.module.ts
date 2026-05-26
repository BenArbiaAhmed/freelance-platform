import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidature } from './entities/candidature.entity';
import { CandidaturesService } from './candidatures.service';
import { CandidaturesController } from './candidatures.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Candidature])],
  controllers: [CandidaturesController],
  providers: [CandidaturesService],
  exports: [CandidaturesService],
})
export class CandidaturesModule {}
