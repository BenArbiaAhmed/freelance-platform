import { create } from 'zustand'
import { api } from '@/lib/api'
import type { Candidature } from '@/lib/mock-data'

type CandidatureStatut = 'pending' | 'accepted' | 'rejected'

interface BackendCandidature {
  id: string
  missionId: string
  freelanceId: string
  lettre: string
  tarifPropose: string | number
  statut: CandidatureStatut
  dateCreation: string
  mission: {
    id: string
    titre: string
    budget: number
    competencesRequises: string[] | null
  }
  freelance?: {
    id: string
    tarifJournalier: string | number | null
    disponible: boolean
    rating: string | number | null
    user: { nom: string; photo: string | null; bio: string | null } | null
    competences?: { competence: { nom: string } }[]
  } | null
}

// Application received by a client, with the applicant's profile attached.
export interface ReceivedApplication {
  id: string
  statut: CandidatureStatut
  lettre: string
  tarifPropose: number
  dateCreation: string
  mission: { id: string; titre: string; budget: number }
  freelance: {
    id: string
    nom: string
    photo: string
    bio: string
    rating: number
    tarifJournalier: number
    disponible: boolean
    competences: string[]
  }
}

function mapSent(c: BackendCandidature): Candidature {
  return {
    id: c.id,
    tarifPropose: Number(c.tarifPropose),
    statut: c.statut,
    dateCreation: c.dateCreation,
    mission: {
      id: c.mission.id,
      titre: c.mission.titre,
      budget: Number(c.mission.budget),
      competencesRequises: c.mission.competencesRequises ?? [],
    },
  }
}

function mapReceived(c: BackendCandidature): ReceivedApplication {
  const nom = c.freelance?.user?.nom ?? 'Unknown freelancer'
  return {
    id: c.id,
    statut: c.statut,
    lettre: c.lettre,
    tarifPropose: Number(c.tarifPropose),
    dateCreation: c.dateCreation,
    mission: {
      id: c.mission.id,
      titre: c.mission.titre,
      budget: Number(c.mission.budget),
    },
    freelance: {
      id: c.freelance?.id ?? c.freelanceId,
      nom,
      photo: c.freelance?.user?.photo ?? `https://i.pravatar.cc/80?u=${encodeURIComponent(nom)}`,
      bio: c.freelance?.user?.bio ?? '',
      rating: Number(c.freelance?.rating ?? 0),
      tarifJournalier: Number(c.freelance?.tarifJournalier ?? 0),
      disponible: c.freelance?.disponible ?? false,
      competences: c.freelance?.competences?.map((fc) => fc.competence.nom) ?? [],
    },
  }
}

interface CandidaturesState {
  // Freelancer's own submitted applications
  candidatures: Candidature[]
  loading: boolean
  error: string | null
  fetchCandidatures: (freelanceId: string) => Promise<void>

  // Applications received on a client's missions
  received: ReceivedApplication[]
  receivedLoading: boolean
  receivedError: string | null
  actingOn: string | null
  fetchReceived: (clientId: string) => Promise<void>
  acceptApplication: (id: string) => Promise<void>
  rejectApplication: (id: string) => Promise<void>
}

export const useCandidaturesStore = create<CandidaturesState>((set) => ({
  candidatures: [],
  loading: false,
  error: null,

  fetchCandidatures: async (freelanceId: string) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get<BackendCandidature[]>('/candidatures', {
        params: { freelanceId },
      })
      set({ candidatures: res.data.map(mapSent), loading: false })
    } catch {
      set({ loading: false, error: 'Failed to load applications' })
    }
  },

  received: [],
  receivedLoading: false,
  receivedError: null,
  actingOn: null,

  fetchReceived: async (clientId: string) => {
    set({ receivedLoading: true, receivedError: null })
    try {
      const res = await api.get<BackendCandidature[]>('/candidatures', {
        params: { clientId },
      })
      set({ received: res.data.map(mapReceived), receivedLoading: false })
    } catch {
      set({ receivedLoading: false, receivedError: 'Failed to load applications' })
    }
  },

  acceptApplication: async (id: string) => {
    set({ actingOn: id })
    try {
      await api.patch(`/candidatures/${id}/accept`)
      set((state) => ({
        actingOn: null,
        received: state.received.map((a) =>
          a.id === id ? { ...a, statut: 'accepted' } : a,
        ),
      }))
    } catch {
      set({ actingOn: null, receivedError: 'Could not accept the application' })
    }
  },

  rejectApplication: async (id: string) => {
    set({ actingOn: id })
    try {
      await api.patch(`/candidatures/${id}/reject`)
      set((state) => ({
        actingOn: null,
        received: state.received.map((a) =>
          a.id === id ? { ...a, statut: 'rejected' } : a,
        ),
      }))
    } catch {
      set({ actingOn: null, receivedError: 'Could not reject the application' })
    }
  },
}))
