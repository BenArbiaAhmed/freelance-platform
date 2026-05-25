import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FreelanceCompetence } from './freelance-competence.entity';

@Entity('competences')
export class Competence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nom: string;

  @Column({ nullable: true })
  categorie: string;

  @OneToMany(() => FreelanceCompetence, (fc) => fc.competence)
  freelances: FreelanceCompetence[];
}
