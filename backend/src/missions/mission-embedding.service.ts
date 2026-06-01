import { Injectable, Logger } from '@nestjs/common';
import { Mission } from './entities/mission.entity';
import { EmbeddingService } from '../matching/embedding.service';
import { QdrantService } from '../matching/qdrant.service';
import { MISSION_COLLECTION } from '../matching/qdrant.constants';
import { buildMissionText, missionSkills } from '../matching/matching.text';

@Injectable()
export class MissionEmbeddingService {
  private readonly logger = new Logger(MissionEmbeddingService.name);

  constructor(
    private readonly embedding: EmbeddingService,
    private readonly qdrant: QdrantService,
  ) {}

  /** Embed a mission and upsert it into Qdrant. Non-fatal on failure. */
  async embedMission(mission: Mission): Promise<void> {
    try {
      const text = buildMissionText(mission);
      if (text.trim().length < 20) {
        this.logger.warn(`Mission ${mission.id} has too little text to embed`);
        return;
      }

      const vector = await this.embedding.embedDocument(text);
      if (!vector.length) {
        this.logger.warn(`Mission ${mission.id} produced an empty vector`);
        return;
      }

      await this.qdrant.upsert(MISSION_COLLECTION, {
        id: mission.id,
        vector,
        payload: {
          missionId: mission.id,
          clientId: mission.clientId,
          titre: mission.titre,
          statut: mission.statut,
          budget: mission.budget,
          skills: missionSkills(mission),
          createdAt: mission.dateCreation?.toISOString?.() ?? undefined,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to embed mission ${mission.id}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  async deleteMission(missionId: string): Promise<void> {
    try {
      await this.qdrant.deletePoint(MISSION_COLLECTION, missionId);
    } catch (err) {
      this.logger.error(
        `Failed to delete mission embedding ${missionId}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }
}
