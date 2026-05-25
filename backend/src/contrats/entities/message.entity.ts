import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contrat } from './contrat.entity';
import { User } from '../../users/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contrat, (contrat) => contrat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contratId' })
  contrat: Contrat;

  @Column('uuid')
  contratId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expediteurId' })
  expediteur: User;

  @Column('uuid')
  expediteurId: string;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ default: false })
  lu: boolean;

  @CreateDateColumn()
  dateEnvoi: Date;
}
