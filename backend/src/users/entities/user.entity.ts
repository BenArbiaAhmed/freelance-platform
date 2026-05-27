import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
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

  // select: false keeps the password hash out of regular queries; it must be
  // explicitly selected (see UsersService.findByEmailWithPassword) for login.
  @Column({ select: false })
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

  // Hash the password before it is first persisted. Updates that change the
  // password are hashed explicitly in UsersService.update to avoid re-hashing
  // an already-hashed value.
  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.motDePasse) {
      this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
    }
  }
}
