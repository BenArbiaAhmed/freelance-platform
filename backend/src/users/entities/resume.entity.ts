import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { FreelanceProfile } from './freelance-profile.entity';

@Entity('resumes')
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

  @CreateDateColumn()
  createdAt: Date;
}
