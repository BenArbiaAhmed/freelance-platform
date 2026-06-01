import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { FreelanceProfile } from '../../users/entities/freelance-profile.entity';
import { ExtractedResume } from '../../matching/extraction/extraction.service';

export enum ResumeStatus {
  UPLOADED = 'uploaded',
  EXTRACTING = 'extracting',
  READY = 'ready',
  FAILED = 'failed',
}

@Entity('resumes')
@Index(['freelanceProfileId', 'status'])
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FreelanceProfile, (profile) => profile.resumes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'freelanceProfileId' })
  freelanceProfile: FreelanceProfile;

  @Index()
  @Column('uuid')
  freelanceProfileId: string;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  mimeType?: string;

  @Column({ type: 'int', nullable: true })
  size?: number;

  @Column({
    type: 'enum',
    enum: ResumeStatus,
    default: ResumeStatus.UPLOADED,
  })
  status: ResumeStatus;

  /** LLM/heuristic-parsed structured CV content (set when status = READY). */
  @Column({ type: 'jsonb', nullable: true })
  extracted?: ExtractedResume | null;

  @Column({ type: 'text', nullable: true })
  extractionError?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
