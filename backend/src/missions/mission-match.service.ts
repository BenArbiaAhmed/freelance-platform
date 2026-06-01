import { Injectable, Logger } from '@nestjs/common';
import { Mission } from './entities/mission.entity';
import { EmbeddingService } from '../matching/embedding.service';
import { QdrantService } from '../matching/qdrant.service';
import { RESUME_COLLECTION } from '../matching/qdrant.constants';
import { buildMissionText } from '../matching/matching.text';

const TOP_K = 5;

export interface MissionMatch {
  resumeId: string;
  freelanceProfileId: string;
  score: number;
}

/**
 * Finds the top freelancers for a freshly created mission so they can be
 * notified via webhooks. (The interactive, hydrated ranking lives in
 * MatchingService.)
 */
@Injectable()
export class MissionMatchService {
  private readonly logger = new Logger(MissionMatchService.name);

  constructor(
    private readonly embedding: EmbeddingService,
    private readonly qdrant: QdrantService,
  ) {}

  async matchMission(mission: Mission): Promise<MissionMatch[]> {
    try {
      const text = buildMissionText(mission);
      if (text.trim().length < 20) return [];

      const vector = await this.embedding.embedDocument(text);
      if (!vector.length) return [];

      const hits = await this.qdrant.search(RESUME_COLLECTION, vector, {
        limit: TOP_K,
      });

      return hits
        .map((hit) => {
          const payload = hit.payload as
            | { resumeId?: string; freelanceProfileId?: string }
            | undefined;
          return {
            resumeId: payload?.resumeId ?? String(hit.id ?? ''),
            freelanceProfileId: payload?.freelanceProfileId ?? '',
            score: hit.score ?? 0,
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
}
