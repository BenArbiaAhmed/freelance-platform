import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FreelanceProfile } from '../../users/entities/freelance-profile.entity';
import { Competence } from './competence.entity';

export enum NiveauCompetence {
  DEBUTANT = 'debutant',
  INTERMEDIAIRE = 'intermediaire',
  AVANCE = 'avance',
  EXPERT = 'expert',
}

@Entity('freelance_competences')
export class FreelanceCompetence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FreelanceProfile, (profile) => profile.competences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'freelanceId' })
  freelanceProfile: FreelanceProfile;

  @Column('uuid')
  freelanceId: string;

  @ManyToOne(() => Competence, (competence) => competence.freelances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'competenceId' })
  competence: Competence;

  @Column('uuid')
  competenceId: string;

  @Column({ type: 'enum', enum: NiveauCompetence, default: NiveauCompetence.INTERMEDIAIRE })
  niveau: NiveauCompetence;
}
