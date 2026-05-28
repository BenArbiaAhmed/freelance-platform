import type { Mission, FreelanceProfile, MissionStatut } from '@/lib/mock-data'

// ─── GraphQL response shapes (searchMissions / searchFreelanceProfiles) ───────

export interface GqlMissionItem {
  id: string
  titre: string
  description: string
  budget: number
  deadline: string | null
  statut: string
  competencesRequises: string[] | null
  dateCreation: string
  client: { entreprise: string | null; user: { nom: string; photo: string | null } | null } | null
}

export interface GqlFreelancerItem {
  id: string
  tarifJournalier: number | null
  disponible: boolean
  rating: number
  user: { nom: string; photo: string | null; bio: string | null }
  competences: { niveau: string; competence: { nom: string } }[]
}

// Nest's GraphQL layer serialises enums by their key (e.g. AVANCE), so normalise
// to the English labels the FreelancerDetail skill bars expect.
const NIVEAU_LABEL: Record<string, string> = {
  debutant: 'Beginner',
  intermediaire: 'Intermediate',
  avance: 'Advanced',
  expert: 'Expert',
}

export function mapMission(item: GqlMissionItem): Mission {
  return {
    id: item.id,
    titre: item.titre,
    description: item.description,
    budget: Number(item.budget ?? 0),
    deadline: item.deadline ?? '',
    statut: (item.statut ?? 'active').toLowerCase() as MissionStatut,
    competencesRequises: item.competencesRequises ?? [],
    dateCreation: item.dateCreation,
    client: {
      nom: item.client?.user?.nom ?? 'Unknown client',
      entreprise: item.client?.entreprise ?? '',
      photo: item.client?.user?.photo ?? undefined,
    },
    candidatureCount: 0,
  }
}

export function mapFreelancer(item: GqlFreelancerItem): FreelanceProfile {
  return {
    id: item.id,
    nom: item.user.nom,
    photo: item.user.photo ?? `https://i.pravatar.cc/80?u=${encodeURIComponent(item.user.nom)}`,
    bio: item.user.bio ?? '',
    tarifJournalier: Number(item.tarifJournalier ?? 0),
    disponible: item.disponible,
    rating: Number(item.rating ?? 0),
    competences: item.competences.map((c) => ({
      nom: c.competence.nom,
      niveau: NIVEAU_LABEL[c.niveau?.toLowerCase()] ?? 'Intermediate',
    })),
  }
}
