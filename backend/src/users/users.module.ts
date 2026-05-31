import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FreelanceProfile } from './entities/freelance-profile.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { Resume } from './entities/resume.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FreelanceProfilesService } from './freelance-profiles.service';
import { FreelanceProfilesController } from './freelance-profiles.controller';
import { ClientProfilesService } from './client-profiles.service';
import { ClientProfilesController } from './client-profiles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FreelanceProfile, ClientProfile, Resume]),
  ],
  controllers: [
    UsersController,
    FreelanceProfilesController,
    ClientProfilesController,
  ],
  providers: [UsersService, FreelanceProfilesService, ClientProfilesService],
  exports: [UsersService, FreelanceProfilesService, ClientProfilesService],
})
export class UsersModule {}
