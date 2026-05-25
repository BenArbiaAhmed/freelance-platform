import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ClientProfile } from '../../users/entities/client-profile.entity';
import { Candidature } from '../../candidatures/entities/candidature.entity';

export enum MissionStatut {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClientProfile, (client) => client.missions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: ClientProfile;

  @Column('uuid')
  clientId: string;

  @Column()
  titre: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  budget: number;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ type: 'enum', enum: MissionStatut, default: MissionStatut.ACTIVE })
  statut: MissionStatut;

  @Column({ type: 'simple-array', nullable: true })
  competencesRequises: string[];

  @CreateDateColumn()
  dateCreation: Date;

  @OneToMany(() => Candidature, (candidature) => candidature.mission)
  candidatures: Candidature[];
}
