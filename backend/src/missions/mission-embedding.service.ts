import { Injectable, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { EmbeddingModel, FlagEmbedding } from 'fastembed';
import { Mission } from './entities/mission.entity';

const MISSION_COLLECTION = 'mission_embeddings';
const EMBEDDING_DIM = 384;

@Injectable()
export class MissionEmbeddingService {
  private readonly logger = new Logger(MissionEmbeddingService.name);
  private readonly client = new QdrantClient({
    url: process.env.QDRANT_URL ?? 'http://localhost:6333',
  });
  private embedderPromise: Promise<FlagEmbedding> | null = null;
  private collectionReady = false;

  async embedMission(mission: Mission): Promise<void> {
    try {
      await this.ensureCollection(EMBEDDING_DIM);
      const text = this.buildMissionText(mission);
      if (!text || text.trim().length < 30) {
        this.logger.warn(
          `Mission ${mission.id} has insufficient text for embeddings`,
        );
        return;
      }

      const embedder = await this.getEmbedder();
      const vector = await this.embedText(embedder, text);
      if (!vector?.length) {
        this.logger.warn(
          `Mission ${mission.id} embedding returned empty vector`,
        );
        return;
      }

      await this.client.upsert(MISSION_COLLECTION, {
        wait: true,
        points: [
          {
            id: mission.id,
            vector,
            payload: {
              missionId: mission.id,
              clientId: mission.clientId,
              titre: mission.titre,
              statut: mission.statut,
              budget: mission.budget,
              competencesRequises: mission.competencesRequises ?? [],
              createdAt: mission.dateCreation?.toISOString?.() ?? undefined,
            },
          },
        ],
      });
    } catch (err) {
      this.logger.error(
        `Failed to embed mission ${mission.id}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  private buildMissionText(mission: Mission): string {
    const skills = mission.competencesRequises?.length
      ? `Skills: ${mission.competencesRequises.join(', ')}`
      : '';
    return [mission.titre, mission.description, skills]
      .filter(Boolean)
      .join('\n');
  }

  private async getEmbedder(): Promise<FlagEmbedding> {
    if (!this.embedderPromise) {
      this.embedderPromise = FlagEmbedding.init({
        model: EmbeddingModel.BGESmallENV15,
      });
    }
    return this.embedderPromise;
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
      const info = await this.client.getCollection(MISSION_COLLECTION);
      const vectors = (info as { config?: { params?: { vectors?: unknown } } })
        ?.config?.params?.vectors;
      const size =
        typeof vectors === 'object' && vectors && 'size' in vectors
          ? (vectors as { size: number }).size
          : undefined;
      if (size && size !== vectorSize) {
        this.logger.warn(
          `Qdrant collection ${MISSION_COLLECTION} has size ${size}, recreating for ${vectorSize}`,
        );
        await this.client.deleteCollection(MISSION_COLLECTION);
      } else {
        this.collectionReady = true;
        return;
      }
    } catch {
      this.logger.warn(
        `Qdrant collection ${MISSION_COLLECTION} missing; creating`,
      );
    }

    await this.client.createCollection(MISSION_COLLECTION, {
      vectors: { size: vectorSize, distance: 'Cosine' },
    });
    this.collectionReady = true;
  }
}
