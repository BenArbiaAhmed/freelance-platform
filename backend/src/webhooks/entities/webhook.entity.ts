import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WebhookLog } from './webhook-log.entity';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.webhooks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @Column()
  url: string;

  @Column({ type: 'simple-array' })
  events: string[];

  @Column({ default: true })
  actif: boolean;

  @CreateDateColumn()
  dateCreation: Date;

  @OneToMany(() => WebhookLog, (log) => log.webhook)
  logs: WebhookLog[];
}
