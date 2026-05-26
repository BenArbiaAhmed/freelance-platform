import {
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NiveauCompetence } from '../competences/entities/freelance-competence.entity';
import { MissionStatut } from '../missions/entities/mission.entity';
import { UserRole } from '../users/entities/user.entity';

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum FreelanceProfileSortField {
  NOM = 'NOM',
  RATING = 'RATING',
  TARIF_JOURNALIER = 'TARIF_JOURNALIER',
}

export enum MissionSortField {
  TITRE = 'TITRE',
  BUDGET = 'BUDGET',
  DEADLINE = 'DEADLINE',
  DATE_CREATION = 'DATE_CREATION',
}

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(NiveauCompetence, { name: 'NiveauCompetence' });
registerEnumType(MissionStatut, { name: 'MissionStatut' });
registerEnumType(SortDirection, { name: 'SortDirection' });
registerEnumType(FreelanceProfileSortField, {
  name: 'FreelanceProfileSortField',
});
registerEnumType(MissionSortField, { name: 'MissionSortField' });

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}

@InputType()
export class FreelanceProfileFilterInput {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tarifJournalierMin?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tarifJournalierMax?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ratingMin?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  keyword?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID(undefined, { each: true })
  competenceIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  competenceNames?: string[];

  @Field(() => [NiveauCompetence], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(NiveauCompetence, { each: true })
  niveaux?: NiveauCompetence[];
}

@InputType()
export class FreelanceProfileSortInput {
  @Field(() => FreelanceProfileSortField, {
    defaultValue: FreelanceProfileSortField.RATING,
  })
  @IsEnum(FreelanceProfileSortField)
  field = FreelanceProfileSortField.RATING;

  @Field(() => SortDirection, { defaultValue: SortDirection.DESC })
  @IsEnum(SortDirection)
  direction = SortDirection.DESC;
}

@InputType()
export class MissionFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  keyword?: string;

  @Field(() => [MissionStatut], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(MissionStatut, { each: true })
  statuts?: MissionStatut[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadlineFrom?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadlineTo?: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  competences?: string[];
}

@InputType()
export class MissionSortInput {
  @Field(() => MissionSortField, {
    defaultValue: MissionSortField.DATE_CREATION,
  })
  @IsEnum(MissionSortField)
  field = MissionSortField.DATE_CREATION;

  @Field(() => SortDirection, { defaultValue: SortDirection.DESC })
  @IsEnum(SortDirection)
  direction = SortDirection.DESC;
}

@ObjectType()
export class UserSummary {
  @Field(() => ID)
  id: string;

  @Field()
  nom: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => String, { nullable: true })
  photo?: string | null;

  @Field(() => String, { nullable: true })
  bio?: string | null;
}

@ObjectType()
export class CompetenceSummary {
  @Field(() => ID)
  id: string;

  @Field()
  nom: string;

  @Field(() => String, { nullable: true })
  categorie?: string | null;
}

@ObjectType()
export class FreelanceCompetenceSummary {
  @Field(() => ID)
  id: string;

  @Field(() => NiveauCompetence)
  niveau: NiveauCompetence;

  @Field(() => CompetenceSummary)
  competence: CompetenceSummary;
}

@ObjectType()
export class FreelanceProfileSearchItem {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => Float, { nullable: true })
  tarifJournalier?: number | null;

  @Field()
  disponible: boolean;

  @Field(() => Float)
  rating: number;

  @Field(() => UserSummary)
  user: UserSummary;

  @Field(() => [FreelanceCompetenceSummary])
  competences: FreelanceCompetenceSummary[];
}

@ObjectType()
export class ClientProfileSummary {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => String, { nullable: true })
  entreprise?: string | null;

  @Field(() => String, { nullable: true })
  siteWeb?: string | null;

  @Field(() => UserSummary, { nullable: true })
  user?: UserSummary | null;
}

@ObjectType()
export class MissionSearchItem {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  clientId: string;

  @Field()
  titre: string;

  @Field()
  description: string;

  @Field(() => Float)
  budget: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deadline?: Date | null;

  @Field(() => MissionStatut)
  statut: MissionStatut;

  @Field(() => [String], { nullable: 'itemsAndList' })
  competencesRequises?: string[] | null;

  @Field(() => GraphQLISODateTime)
  dateCreation: Date;

  @Field(() => ClientProfileSummary, { nullable: true })
  client?: ClientProfileSummary | null;
}

@ObjectType()
export class PaginatedFreelanceProfileResult {
  @Field(() => [FreelanceProfileSearchItem])
  items: FreelanceProfileSearchItem[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;
}

@ObjectType()
export class PaginatedMissionResult {
  @Field(() => [MissionSearchItem])
  items: MissionSearchItem[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;
}
