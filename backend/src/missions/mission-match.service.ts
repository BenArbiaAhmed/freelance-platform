import { Injectable, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { EmbeddingModel, FlagEmbedding } from 'fastembed';
import { Mission } from './entities/mission.entity';

const RESUME_COLLECTION = 'resume_embeddings';
const EMBEDDING_DIM = 384;
const TOP_K = 5;

export interface MissionMatch {
  resumeId: string;
  freelanceProfileId: string;
  score: number;
}

@Injectable()
export class MissionMatchService {
  private readonly logger = new Logger(MissionMatchService.name);
  private readonly client = new QdrantClient({
    url: process.env.QDRANT_URL ?? 'http://localhost:6333',
  });
  private embedderPromise: Promise<FlagEmbedding> | null = null;

  async matchMission(mission: Mission): Promise<MissionMatch[]> {
    try {
      const text = this.buildMissionText(mission);
      if (!text || text.trim().length < 30) {
        return [];
      }
      const embedder = await this.getEmbedder();
      const vector = await this.embedText(embedder, text);
      if (!vector?.length || vector.length !== EMBEDDING_DIM) {
        return [];
      }

      const result = await this.client.search(RESUME_COLLECTION, {
        vector,
        limit: TOP_K,
        with_payload: true,
      });

      return (result ?? [])
        .map((point) => {
          const payload = point.payload as
            | { resumeId?: string; freelanceProfileId?: string }
            | undefined;
          const resumeId =
            payload?.resumeId ?? (point.id as string | undefined) ?? '';
          const freelanceProfileId = payload?.freelanceProfileId ?? '';
          return {
            resumeId,
            freelanceProfileId,
            score: point.score ?? 0,
          };
        })
        .filter((match) => match.resumeId && match.freelanceProfileId);
    } catch (err) {
      this.logger.error(
        `Failed to match resumes for mission ${mission.id}`,
        err instanceof Error ? err.stack : undefined,
      );
      return [];
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
}
