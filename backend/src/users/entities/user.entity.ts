import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { FreelanceProfile } from './freelance-profile.entity';
import { ClientProfile } from './client-profile.entity';
import { Webhook } from '../../webhooks/entities/webhook.entity';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  FREELANCE = 'freelance',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ unique: true })
  email: string;

  @Column()
  motDePasse: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @CreateDateColumn()
  dateCreation: Date;

  @OneToOne(() => FreelanceProfile, (profile) => profile.user, { nullable: true })
  freelanceProfile: FreelanceProfile;

  @OneToOne(() => ClientProfile, (profile) => profile.user, { nullable: true })
  clientProfile: ClientProfile;

  @OneToMany(() => Webhook, (webhook) => webhook.user)
  webhooks: Webhook[];
}
