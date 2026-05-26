import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from '../missions/entities/mission.entity';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { SearchResolver } from './search.resolver';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([FreelanceProfile, Mission])],
  providers: [SearchResolver, SearchService],
})
export class SearchModule {}
