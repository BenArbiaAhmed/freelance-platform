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
import { GroqExtractionService } from './extraction/groq-extraction.service';
import { LlamaCloudParseService } from './parsing/llama-cloud-parse.service';

/**
 * Global AI infrastructure: a single embedding model, a single Qdrant client,
 * the document parser (LlamaCloud) and the resume extractor (Groq) are shared
 * across the Missions and Resumes modules (which inject them without importing
 * this module).
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Mission, FreelanceProfile, Resume])],
  controllers: [MatchingController],
  providers: [
    EmbeddingService,
    QdrantService,
    LlamaCloudParseService,
    { provide: ExtractionService, useClass: GroqExtractionService },
    MatchingService,
  ],
  exports: [
    EmbeddingService,
    QdrantService,
    LlamaCloudParseService,
    ExtractionService,
  ],
})
export class MatchingModule {}
