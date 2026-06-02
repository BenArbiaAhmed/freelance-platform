import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EmbeddingModel, FlagEmbedding } from 'fastembed';

/**
 * Single shared text-embedding model for the whole app, so missions, resumes
 * and queries always land in the *same* vector space.
 *
 * `EMBEDDING_MODEL`:
 *   - `multilingual` (default) → multilingual-e5-large (1024d). Recommended:
 *     the platform's content is French. e5 needs `passage:`/`query:` prefixes,
 *     handled here transparently via fastembed's passageEmbed/queryEmbed.
 *   - `bge-small-en`           → BGE-small-en-v1.5 (384d). Fast, English-only.
 *
 * Switching model changes the vector dimension, which makes QdrantService
 * recreate its collections (existing points must be re-embedded).
 */
@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly model: Exclude<EmbeddingModel, EmbeddingModel.CUSTOM>;
  private readonly isE5: boolean;
  readonly dimension: number;
  readonly modelName: string;
  private embedderPromise: Promise<FlagEmbedding> | null = null;

  constructor() {
    const choice = (
      process.env.EMBEDDING_MODEL ?? 'multilingual'
    ).toLowerCase();
    if (choice === 'bge-small-en' || choice === 'bge') {
      this.model = EmbeddingModel.BGESmallENV15;
      this.dimension = 384;
      this.isE5 = false;
    } else {
      this.model = EmbeddingModel.MLE5Large;
      this.dimension = 1024;
      this.isE5 = true;
    }
    this.modelName = this.model;
  }

  async onModuleInit(): Promise<void> {
    // Warm up off the request path: first call downloads (~large for e5) and
    // loads the ONNX model. Non-fatal so the app still boots if it fails.
    try {
      await this.embedDocument('warm-up');
      this.logger.log(
        `Embedding model ready: ${this.modelName} (${this.dimension}d)`,
      );
    } catch (err) {
      this.logger.warn(
        `Embedding model warm-up failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /** Embed a corpus document (mission/resume). */
  async embedDocument(text: string): Promise<number[]> {
    return this.embedOne(text, 'document');
  }

  /** Embed a free-text search query. */
  async embedQuery(text: string): Promise<number[]> {
    return this.embedOne(text, 'query');
  }

  private async embedOne(
    text: string,
    kind: 'document' | 'query',
  ): Promise<number[]> {
    const embedder = await this.getEmbedder();
    const clean = text.trim() || ' ';

    if (this.isE5) {
      if (kind === 'query') {
        return Array.from(await embedder.queryEmbed(clean));
      }
      for await (const batch of embedder.passageEmbed([clean], 1)) {
        return Array.from(batch[0]);
      }
      return [];
    }

    // BGE models are used without e5 prefixes.
    for await (const batch of embedder.embed([clean], 1)) {
      return Array.from(batch[0]);
    }
    return [];
  }

  private getEmbedder(): Promise<FlagEmbedding> {
    if (!this.embedderPromise) {
      this.embedderPromise = FlagEmbedding.init({
        model: this.model,
        maxLength: 512,
        cacheDir: process.env.FASTEMBED_CACHE_DIR ?? 'local_cache',
      });
    }
    return this.embedderPromise;
  }
}
