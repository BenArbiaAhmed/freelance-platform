import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { FreelanceProfile } from './users/entities/freelance-profile.entity';
import { ClientProfile } from './users/entities/client-profile.entity';
import { Resume } from './users/entities/resume.entity';
import { Competence } from './competences/entities/competence.entity';
import { FreelanceCompetence } from './competences/entities/freelance-competence.entity';
import { Mission } from './missions/entities/mission.entity';
import { Candidature } from './candidatures/entities/candidature.entity';
import { Contrat } from './contrats/entities/contrat.entity';
import { Livrable } from './contrats/entities/livrable.entity';
import { Message } from './contrats/entities/message.entity';
import { Paiement } from './paiements/entities/paiement.entity';
import { Webhook } from './webhooks/entities/webhook.entity';
import { WebhookLog } from './webhooks/entities/webhook-log.entity';
import { UsersModule } from './users/users.module';
import { CompetencesModule } from './competences/competences.module';
import { MissionsModule } from './missions/missions.module';
import { CandidaturesModule } from './candidatures/candidatures.module';
import { ContratsModule } from './contrats/contrats.module';
import { PaiementsModule } from './paiements/paiements.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      graphiql: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_NAME', 'freelancehub'),
        entities: [
          User,
          FreelanceProfile,
          ClientProfile,
          Resume,
          Competence,
          FreelanceCompetence,
          Mission,
          Candidature,
          Contrat,
          Livrable,
          Message,
          Paiement,
          Webhook,
          WebhookLog,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    UsersModule,
    CompetencesModule,
    MissionsModule,
    CandidaturesModule,
    ContratsModule,
    PaiementsModule,
    WebhooksModule,
    SearchModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
