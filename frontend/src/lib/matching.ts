import { api } from '@/lib/api'

// ─── Response shapes (mirror backend matching DTOs) ──────────────────────────

export interface MatchedMission {
  id: string
  clientId: string
  titre: string
  description: string
  budget: number
  deadline: string | null
  statut: string
  competencesRequises: string[]
  requiredSkills: string[]
  experienceLevel: string | null
  dateCreation: string
  client: {
    id: string
    entreprise: string | null
    user: { id: string; nom: string; photo: string | null } | null
  } | null
  matchScore: number
  skillOverlap: number
}

export interface MatchedFreelance {
  id: string
  userId: string
  tarifJournalier: number | null
  disponible: boolean
  rating: number
  user: { id: string; nom: string; photo: string | null; bio: string | null }
  competences: { niveau: string; competence: { id: string; nom: string } }[]
  resumeSkills: string[]
  matchScore: number
  skillOverlap: number
}

/** Missions recommended for the signed-in freelancer (based on their resume). */
export async function getRecommendedMissions(): Promise<MatchedMission[]> {
  const { data } = await api.get<MatchedMission[]>('/matching/missions')
  return data
}

/** Freelancers best matched to a mission owned by the signed-in client. */
export async function getMatchedFreelancers(
  missionId: string,
): Promise<MatchedFreelance[]> {
  const { data } = await api.get<MatchedFreelance[]>(
    `/matching/missions/${missionId}/freelancers`,
  )
  return data
}

/** Turns a cosine score (roughly 0–1) into a 0–100 percentage for display. */
export function matchPercent(score: number): number {
  return Math.round(Math.max(0, Math.min(1, score)) * 100)
}
