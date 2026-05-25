import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';
import { ClientProfile } from '../../users/entities/client-profile.entity';
import { FreelanceProfile } from '../../users/entities/freelance-profile.entity';
import { Candidature } from '../../candidatures/entities/candidature.entity';
import { Livrable } from './livrable.entity';
import { Message } from './message.entity';
import { Paiement } from '../../paiements/entities/paiement.entity';

export enum ContratStatut {
  DRAFT = 'draft',
  SIGNED = 'signed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('contrats')
export class Contrat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Mission, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'missionId' })
  mission: Mission;

  @Column({ nullable: true })
  missionId: string;

  @ManyToOne(() => ClientProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: ClientProfile;

  @Column('uuid')
  clientId: string;

  @ManyToOne(() => FreelanceProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'freelanceId' })
  freelance: FreelanceProfile;

  @Column('uuid')
  freelanceId: string;

  @OneToOne(() => Candidature, (candidature) => candidature.contrat, { nullable: true })
  @JoinColumn({ name: 'candidatureId' })
  candidature: Candidature;

  @Column({ nullable: true })
  candidatureId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;

  @Column({ type: 'enum', enum: ContratStatut, default: ContratStatut.DRAFT })
  statut: ContratStatut;

  @Column({ default: false })
  signéParClient: boolean;

  @Column({ default: false })
  signéParFreelance: boolean;

  @CreateDateColumn()
  dateCreation: Date;

  @OneToMany(() => Livrable, (livrable) => livrable.contrat)
  livrables: Livrable[];

  @OneToMany(() => Message, (message) => message.contrat)
  messages: Message[];

  @OneToMany(() => Paiement, (paiement) => paiement.contrat)
  paiements: Paiement[];
}
