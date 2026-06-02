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
  freelanceSkills: string[]
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

export function matchLabel(score: number): string {
  const pct = matchPercent(score)
  if (pct >= 75) return 'Strong match'
  if (pct >= 55) return 'Good match'
  if (pct >= 35) return 'Fair match'
  return 'Partial match'
}

/** Tailwind classes for coloring a match badge by score tier. */
export function matchColors(score: number): { badge: string; dot: string } {
  const pct = matchPercent(score)
  if (pct >= 75) return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
  if (pct >= 55) return { badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' }
  if (pct >= 35) return { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' }
  return { badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' }
}
