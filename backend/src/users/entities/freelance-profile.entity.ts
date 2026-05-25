import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { FreelanceCompetence } from '../../competences/entities/freelance-competence.entity';
import { Candidature } from '../../candidatures/entities/candidature.entity';

@Entity('freelance_profiles')
export class FreelanceProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.freelanceProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column('uuid')
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tarifJournalier: number;

  @Column({ default: true })
  disponible: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @OneToMany(() => FreelanceCompetence, (fc) => fc.freelanceProfile)
  competences: FreelanceCompetence[];

  @OneToMany(() => Candidature, (candidature) => candidature.freelance)
  candidatures: Candidature[];
}
