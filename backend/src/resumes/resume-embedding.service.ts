import { Injectable, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { EmbeddingModel, FlagEmbedding } from 'fastembed';
import { readFile } from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { Resume } from './entities/resume.entity';

const RESUME_COLLECTION = 'resume_embeddings';
const EMBEDDING_DIM = 384;

@Injectable()
export class ResumeEmbeddingService {
  private readonly logger = new Logger(ResumeEmbeddingService.name);
  private readonly client = new QdrantClient({
    url: process.env.QDRANT_URL ?? 'http://localhost:6333',
  });
  private embedderPromise: Promise<FlagEmbedding> | null = null;
  private collectionReady = false;

  async embedResume(
    resume: Resume,
    filePath: string,
    mimeType?: string | null,
  ): Promise<void> {
    try {
      await this.ensureCollection(EMBEDDING_DIM);
      const text = await this.extractText(filePath, mimeType);
      if (!text || text.trim().length < 30) {
        this.logger.warn(
          `Resume ${resume.id} has insufficient text for embeddings`,
        );
        return;
      }

      const embedder = await this.getEmbedder();
      const vector = await this.embedText(embedder, text);
      if (!vector?.length) {
        this.logger.warn(`Resume ${resume.id} embedding returned empty vector`);
        return;
      }

      try {
        await this.client.upsert(RESUME_COLLECTION, {
          wait: true,
          points: [
            {
              id: resume.id,
              vector,
              payload: {
                resumeId: resume.id,
                freelanceProfileId: resume.freelanceProfileId,
                fileName: resume.fileName,
                fileUrl: resume.fileUrl,
                createdAt: resume.createdAt?.toISOString?.() ?? undefined,
              },
            },
          ],
        });
      } catch (err) {
        const details = (err as { response?: { data?: unknown } })?.response
          ?.data;
        this.logger.error(
          `Qdrant upsert failed for resume ${resume.id} (dim=${vector.length})`,
          details ? JSON.stringify(details) : undefined,
        );
        throw err;
      }
    } catch (err) {
      this.logger.error(
        `Failed to embed resume ${resume.id}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  private async getEmbedder(): Promise<FlagEmbedding> {
    if (!this.embedderPromise) {
      this.embedderPromise = FlagEmbedding.init({
        model: EmbeddingModel.BGESmallENV15,
      });
    }
    return this.embedderPromise;
  }

  private async extractText(
    filePath: string,
    mimeType?: string | null,
  ): Promise<string> {
    const buffer = await readFile(filePath);
    if (mimeType === 'application/pdf') {
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        return result.text ?? '';
      } finally {
        await parser.destroy();
      }
    }
    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? '';
    }
    if (mimeType === 'application/msword') {
      this.logger.warn(
        `Legacy .doc format not supported for resume embeddings (${filePath})`,
      );
      return '';
    }
    const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
    this.logger.warn(`Unsupported resume type .${ext} for embeddings`);
    return '';
  }

  private async embedText(
    embedder: FlagEmbedding,
    text: string,
  ): Promise<number[] | undefined> {
    const generator = embedder.embed([text]);
    for await (const batch of generator) {
      const first = batch[0];
      return Array.isArray(first) ? first : Array.from(first as number[]);
    }
    return undefined;
  }

  private async ensureCollection(vectorSize: number): Promise<void> {
    if (this.collectionReady) return;
    try {
      const info = await this.client.getCollection(RESUME_COLLECTION);
      const vectors = (info as { config?: { params?: { vectors?: unknown } } })
        ?.config?.params?.vectors;
      const size =
        typeof vectors === 'object' && vectors && 'size' in vectors
          ? (vectors as { size: number }).size
          : undefined;
      if (size && size !== vectorSize) {
        this.logger.warn(
          `Qdrant collection ${RESUME_COLLECTION} has size ${size}, recreating for ${vectorSize}`,
        );
        await this.client.deleteCollection(RESUME_COLLECTION);
      } else {
        this.collectionReady = true;
        return;
      }
    } catch {
      this.logger.warn(
        `Qdrant collection ${RESUME_COLLECTION} missing; creating`,
      );
    }

    await this.client.createCollection(RESUME_COLLECTION, {
      vectors: { size: vectorSize, distance: 'Cosine' },
    });
    this.collectionReady = true;
  }
}
