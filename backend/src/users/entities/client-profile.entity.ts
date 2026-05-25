import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Mission } from '../../missions/entities/mission.entity';

@Entity('client_profiles')
export class ClientProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.clientProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column('uuid')
  userId: string;

  @Column({ nullable: true })
  entreprise: string;

  @Column({ nullable: true })
  siteWeb: string;

  @OneToMany(() => Mission, (mission) => mission.client)
  missions: Mission[];
}
