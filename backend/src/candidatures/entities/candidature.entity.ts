import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Mission } from '../../missions/entities/mission.entity';
import { FreelanceProfile } from '../../users/entities/freelance-profile.entity';
import { Contrat } from '../../contrats/entities/contrat.entity';

export enum CandidatureStatut {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('candidatures')
export class Candidature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Mission, (mission) => mission.candidatures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'missionId' })
  mission: Mission;

  @Column('uuid')
  missionId: string;

  @ManyToOne(() => FreelanceProfile, (freelance) => freelance.candidatures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'freelanceId' })
  freelance: FreelanceProfile;

  @Column('uuid')
  freelanceId: string;

  @Column({ type: 'text' })
  lettre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tarifPropose: number;

  @Column({ type: 'enum', enum: CandidatureStatut, default: CandidatureStatut.PENDING })
  statut: CandidatureStatut;

  @CreateDateColumn()
  dateCreation: Date;

  @OneToOne(() => Contrat, (contrat) => contrat.candidature, { nullable: true })
  contrat: Contrat;
}
