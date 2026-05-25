import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Webhook } from './webhook.entity';

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Webhook, (webhook) => webhook.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'webhookId' })
  webhook: Webhook;

  @Column('uuid')
  webhookId: string;

  @Column()
  event: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ default: false })
  succes: boolean;

  @CreateDateColumn()
  dateCreation: Date;
}
