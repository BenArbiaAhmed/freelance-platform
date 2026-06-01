import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from '../missions/entities/mission.entity';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { Resume } from '../resumes/entities/resume.entity';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { EmbeddingService } from './embedding.service';
import { QdrantService } from './qdrant.service';
import { ExtractionService } from './extraction/extraction.service';
import { OllamaExtractionService } from './extraction/ollama-extraction.service';

/**
 * Global AI infrastructure: a single embedding model, a single Qdrant client
 * and the resume extractor are shared across the Missions and Resumes modules
 * (which inject them without importing this module).
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Mission, FreelanceProfile, Resume])],
  controllers: [MatchingController],
  providers: [
    EmbeddingService,
    QdrantService,
    { provide: ExtractionService, useClass: OllamaExtractionService },
    MatchingService,
  ],
  exports: [EmbeddingService, QdrantService, ExtractionService],
})
export class MatchingModule {}
