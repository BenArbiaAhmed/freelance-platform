import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly service: MatchingService) {}

  /** Missions recommended for the signed-in freelancer (based on their resume). */
  @Get('missions')
  @Roles(UserRole.FREELANCE)
  recommendedMissions(@CurrentUser('userId') userId: string) {
    return this.service.recommendMissionsForFreelance(userId);
  }

  /** Freelancers best matched to a mission owned by the signed-in client. */
  @Get('missions/:id/freelancers')
  @Roles(UserRole.CLIENT)
  matchedFreelancers(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.service.matchFreelancesForMission(id, userId);
  }
}
