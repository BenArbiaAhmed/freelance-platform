import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contrat } from './contrat.entity';

export enum LivrableStatut {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
}

@Entity('livrables')
export class Livrable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contrat, (contrat) => contrat.livrables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contratId' })
  contrat: Contrat;

  @Column('uuid')
  contratId: string;

  @Column()
  titre: string;

  @Column()
  url: string;

  @Column({ type: 'enum', enum: LivrableStatut, default: LivrableStatut.PENDING })
  statut: LivrableStatut;

  @CreateDateColumn()
  dateDepot: Date;
}
