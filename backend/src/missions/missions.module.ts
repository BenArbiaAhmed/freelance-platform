import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { MissionEmbeddingService } from './mission-embedding.service';
import { MissionMatchService } from './mission-match.service';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, FreelanceProfile]),
    WebhooksModule,
  ],
  controllers: [MissionsController],
  providers: [MissionsService, MissionEmbeddingService, MissionMatchService],
  exports: [MissionsService],
})
export class MissionsModule {}
