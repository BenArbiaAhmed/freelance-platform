import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contrat } from '../../contrats/entities/contrat.entity';

export enum PaiementStatut {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('paiements')
export class Paiement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contrat, (contrat) => contrat.paiements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contratId' })
  contrat: Contrat;

  @Column('uuid')
  contratId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant: number;

  @Column({ type: 'enum', enum: PaiementStatut, default: PaiementStatut.PENDING })
  statut: PaiementStatut;

  @Column({ nullable: true })
  stripePaymentId: string;

  @CreateDateColumn()
  dateCreation: Date;
}
