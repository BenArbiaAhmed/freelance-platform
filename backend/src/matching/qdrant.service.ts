import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { EmbeddingService } from './embedding.service';
import { MISSION_COLLECTION, RESUME_COLLECTION } from './qdrant.constants';

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

export interface QdrantHit {
  id: string | number;
  score?: number;
  payload?: Record<string, unknown> | null;
}

/**
 * Thin wrapper around a single Qdrant client. Bootstraps both collections at
 * the embedding model's dimension on startup (idempotent; recreates on a
 * dimension change). Tolerant of Qdrant being down at boot — the app still
 * starts and CRUD keeps working.
 */
@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private readonly client = new QdrantClient({
    url: process.env.QDRANT_URL ?? 'http://localhost:6333',
  });

  constructor(private readonly embedding: EmbeddingService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureCollection(MISSION_COLLECTION, true);
    await this.ensureCollection(RESUME_COLLECTION, false);
  }

  async upsert(collection: string, point: QdrantPoint): Promise<void> {
    await this.client.upsert(collection, { wait: true, points: [point] });
  }

  async deletePoint(collection: string, id: string): Promise<void> {
    await this.client.delete(collection, { wait: true, points: [id] });
  }

  async search(
    collection: string,
    vector: number[],
    options: { limit: number; filter?: Record<string, unknown> },
  ): Promise<QdrantHit[]> {
    const result = await this.client.search(collection, {
      vector,
      limit: options.limit,
      with_payload: true,
      filter: options.filter,
    });
    return result ?? [];
  }

  /** Fetch a stored vector by point id (= entity UUID), or null if absent. */
  async retrieveVector(
    collection: string,
    id: string,
  ): Promise<number[] | null> {
    const points = await this.client.retrieve(collection, {
      ids: [id],
      with_vector: true,
    });
    const vector = points?.[0]?.vector;
    return Array.isArray(vector) ? (vector as number[]) : null;
  }

  private async ensureCollection(
    name: string,
    indexStatut: boolean,
  ): Promise<void> {
    const size = this.embedding.dimension;
    try {
      const info = await this.client.getCollection(name);
      const current = this.collectionSize(info);
      if (current && current !== size) {
        this.logger.warn(
          `Collection ${name} is ${current}d but model is ${size}d — recreating (points must be re-embedded)`,
        );
        await this.client.deleteCollection(name);
      } else {
        return; // already present at the right dimension
      }
    } catch {
      this.logger.log(`Collection ${name} missing — creating (${size}d)`);
    }

    try {
      await this.client.createCollection(name, {
        vectors: { size, distance: 'Cosine' },
      });
      // Payload indexes speed up the filtered searches we run.
      await this.createIndex(name, 'freelanceProfileId');
      if (indexStatut) await this.createIndex(name, 'statut');
    } catch (err) {
      this.logger.warn(
        `Could not bootstrap collection ${name} (is Qdrant running?): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  private async createIndex(name: string, field: string): Promise<void> {
    try {
      await this.client.createPayloadIndex(name, {
        field_name: field,
        field_schema: 'keyword',
      });
    } catch {
      // Index may already exist — ignore.
    }
  }

  private collectionSize(info: unknown): number | undefined {
    const vectors = (info as { config?: { params?: { vectors?: unknown } } })
      ?.config?.params?.vectors;
    if (vectors && typeof vectors === 'object' && 'size' in vectors) {
      return (vectors as { size: number }).size;
    }
    return undefined;
  }
}
