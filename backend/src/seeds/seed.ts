import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/entities/user.entity';
import { ClientProfile } from '../users/entities/client-profile.entity';
import { FreelanceProfile } from '../users/entities/freelance-profile.entity';
import { Competence } from '../competences/entities/competence.entity';
import {
  FreelanceCompetence,
  NiveauCompetence,
} from '../competences/entities/freelance-competence.entity';
import { Mission, MissionStatut } from '../missions/entities/mission.entity';
import {
  Candidature,
  CandidatureStatut,
} from '../candidatures/entities/candidature.entity';
import { Contrat, ContratStatut } from '../contrats/entities/contrat.entity';
import { Livrable, LivrableStatut } from '../contrats/entities/livrable.entity';
import { Message } from '../contrats/entities/message.entity';
import { Paiement, PaiementStatut } from '../paiements/entities/paiement.entity';
import { Webhook } from '../webhooks/entities/webhook.entity';
import { WebhookLog } from '../webhooks/entities/webhook-log.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const clientRepo = app.get<Repository<ClientProfile>>(getRepositoryToken(ClientProfile));
  const freelanceRepo = app.get<Repository<FreelanceProfile>>(
    getRepositoryToken(FreelanceProfile),
  );
  const competenceRepo = app.get<Repository<Competence>>(getRepositoryToken(Competence));
  const freelanceCompRepo = app.get<Repository<FreelanceCompetence>>(
    getRepositoryToken(FreelanceCompetence),
  );
  const missionRepo = app.get<Repository<Mission>>(getRepositoryToken(Mission));
  const candidatureRepo = app.get<Repository<Candidature>>(getRepositoryToken(Candidature));
  const contratRepo = app.get<Repository<Contrat>>(getRepositoryToken(Contrat));
  const livrableRepo = app.get<Repository<Livrable>>(getRepositoryToken(Livrable));
  const messageRepo = app.get<Repository<Message>>(getRepositoryToken(Message));
  const paiementRepo = app.get<Repository<Paiement>>(getRepositoryToken(Paiement));
  const webhookRepo = app.get<Repository<Webhook>>(getRepositoryToken(Webhook));
  const webhookLogRepo = app.get<Repository<WebhookLog>>(getRepositoryToken(WebhookLog));

  const clientUser =
    (await userRepo.findOne({ where: { email: 'client@example.com' } })) ??
    (await userRepo.save(
      userRepo.create({
        nom: 'Client One',
        email: 'client@example.com',
        motDePasse: 'password',
        role: UserRole.CLIENT,
      }),
    ));

  const freelanceUser =
    (await userRepo.findOne({ where: { email: 'freelance@example.com' } })) ??
    (await userRepo.save(
      userRepo.create({
        nom: 'Freelance One',
        email: 'freelance@example.com',
        motDePasse: 'password',
        role: UserRole.FREELANCE,
      }),
    ));

  await userRepo.findOne({ where: { email: 'admin@example.com' } }) ??
    (await userRepo.save(
      userRepo.create({
        nom: 'Admin',
        email: 'admin@example.com',
        motDePasse: 'password',
        role: UserRole.ADMIN,
      }),
    ));

  const clientProfile =
    (await clientRepo.findOne({ where: { userId: clientUser.id } })) ??
    (await clientRepo.save(
      clientRepo.create({
        userId: clientUser.id,
        entreprise: 'Acme Corp',
        siteWeb: 'https://example.com',
      }),
    ));

  const freelanceProfile =
    (await freelanceRepo.findOne({ where: { userId: freelanceUser.id } })) ??
    (await freelanceRepo.save(
      freelanceRepo.create({
        userId: freelanceUser.id,
        tarifJournalier: 350,
        disponible: true,
        rating: 4.6,
      }),
    ));

  const competenceReact =
    (await competenceRepo.findOne({ where: { nom: 'React' } })) ??
    (await competenceRepo.save(
      competenceRepo.create({ nom: 'React', categorie: 'frontend' }),
    ));

  const competenceNode =
    (await competenceRepo.findOne({ where: { nom: 'Node.js' } })) ??
    (await competenceRepo.save(
      competenceRepo.create({ nom: 'Node.js', categorie: 'backend' }),
    ));

  await freelanceCompRepo.findOne({
    where: { freelanceId: freelanceProfile.id, competenceId: competenceReact.id },
  }) ??
    (await freelanceCompRepo.save(
      freelanceCompRepo.create({
        freelanceId: freelanceProfile.id,
        competenceId: competenceReact.id,
        niveau: NiveauCompetence.EXPERT,
      }),
    ));

  await freelanceCompRepo.findOne({
    where: { freelanceId: freelanceProfile.id, competenceId: competenceNode.id },
  }) ??
    (await freelanceCompRepo.save(
      freelanceCompRepo.create({
        freelanceId: freelanceProfile.id,
        competenceId: competenceNode.id,
        niveau: NiveauCompetence.AVANCE,
      }),
    ));

  const mission =
    (await missionRepo.findOne({ where: { titre: 'Landing page rebuild' } })) ??
    (await missionRepo.save(
      missionRepo.create({
        clientId: clientProfile.id,
        titre: 'Landing page rebuild',
        description: 'Rebuild the marketing landing page with modern UI.',
        budget: 2500,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        statut: MissionStatut.ACTIVE,
        competencesRequises: ['React', 'CSS'],
      }),
    ));

  const candidature =
    (await candidatureRepo.findOne({
      where: { missionId: mission.id, freelanceId: freelanceProfile.id },
    })) ??
    (await candidatureRepo.save(
      candidatureRepo.create({
        missionId: mission.id,
        freelanceId: freelanceProfile.id,
        lettre: 'I would love to help with this project.',
        tarifPropose: 2600,
        statut: CandidatureStatut.PENDING,
      }),
    ));

  const contrat =
    (await contratRepo.findOne({ where: { candidatureId: candidature.id } })) ??
    (await contratRepo.save(
      contratRepo.create({
        missionId: mission.id,
        clientId: clientProfile.id,
        freelanceId: freelanceProfile.id,
        candidatureId: candidature.id,
        montant: 2600,
        statut: ContratStatut.SIGNED,
        signéParClient: true,
        signéParFreelance: true,
      }),
    ));

  await livrableRepo.findOne({ where: { contratId: contrat.id, titre: 'MVP UI' } }) ??
    (await livrableRepo.save(
      livrableRepo.create({
        contratId: contrat.id,
        titre: 'MVP UI',
        url: 'https://example.com/livrables/mvp',
        statut: LivrableStatut.VALIDATED,
      }),
    ));

  await messageRepo.findOne({ where: { contratId: contrat.id, contenu: 'Welcome aboard!' } }) ??
    (await messageRepo.save(
      messageRepo.create({
        contratId: contrat.id,
        expediteurId: clientUser.id,
        contenu: 'Welcome aboard!',
        lu: true,
      }),
    ));

  await paiementRepo.findOne({ where: { contratId: contrat.id } }) ??
    (await paiementRepo.save(
      paiementRepo.create({
        contratId: contrat.id,
        montant: 1300,
        statut: PaiementStatut.COMPLETED,
        stripePaymentId: 'pi_demo_123',
      }),
    ));

  const webhook =
    (await webhookRepo.findOne({
      where: { userId: clientUser.id, url: 'https://example.com/webhooks' },
    })) ??
    (await webhookRepo.save(
      webhookRepo.create({
        userId: clientUser.id,
        url: 'https://example.com/webhooks',
        events: ['candidature-status'],
        actif: true,
      }),
    ));

  await webhookLogRepo.findOne({ where: { webhookId: webhook.id, event: 'candidature-status' } }) ??
    (await webhookLogRepo.save(
      webhookLogRepo.create({
        webhookId: webhook.id,
        event: 'candidature-status',
        payload: {
          candidatureId: candidature.id,
          statut: candidature.statut,
        },
        statusCode: 200,
        succes: true,
      }),
    ));

  await app.close();
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exit(1);
});
