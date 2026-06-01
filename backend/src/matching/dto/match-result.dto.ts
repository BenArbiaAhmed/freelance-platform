/** Shapes returned by the matching endpoints (vector score attached). */

export interface MatchedMissionClient {
  id: string;
  entreprise: string | null;
  user: { id: string; nom: string; photo: string | null } | null;
}

export interface MatchedMission {
  id: string;
  clientId: string;
  titre: string;
  description: string;
  budget: number;
  deadline: Date | null;
  statut: string;
  competencesRequises: string[];
  requiredSkills: string[];
  experienceLevel: string | null;
  dateCreation: Date;
  client: MatchedMissionClient | null;
  matchScore: number;
  /** Resume↔mission skill overlap (0–1), for transparency in the UI. */
  skillOverlap: number;
}

export interface MatchedFreelanceCompetence {
  niveau: string;
  competence: { id: string; nom: string };
}

export interface MatchedFreelance {
  id: string;
  userId: string;
  tarifJournalier: number | null;
  disponible: boolean;
  rating: number;
  user: { id: string; nom: string; photo: string | null; bio: string | null };
  competences: MatchedFreelanceCompetence[];
  /** Skills parsed from the freelancer's resume. */
  resumeSkills: string[];
  matchScore: number;
  skillOverlap: number;
}
