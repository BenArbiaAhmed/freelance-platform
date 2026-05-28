import { create } from 'zustand'
import { api } from '@/lib/api'

type ContratStatut = 'draft' | 'signed' | 'completed' | 'cancelled'

interface BackendContrat {
  id: string
  montant: string | number
  statut: ContratStatut
  dateCreation: string
  mission: { titre: string } | null
  client: { entreprise: string | null; user: { nom: string } | null } | null
  freelance: { user: { nom: string } | null } | null
}

export interface ContratItem {
  id: string
  montant: number
  statut: ContratStatut
  dateCreation: string
  missionTitre: string
  clientNom: string
  clientEntreprise: string
  freelanceNom: string
}

function mapContrat(c: BackendContrat): ContratItem {
  return {
    id: c.id,
    montant: Number(c.montant),
    statut: c.statut,
    dateCreation: c.dateCreation,
    missionTitre: c.mission?.titre ?? 'Untitled mission',
    clientNom: c.client?.user?.nom ?? 'Unknown client',
    clientEntreprise: c.client?.entreprise ?? '',
    freelanceNom: c.freelance?.user?.nom ?? 'Unknown freelancer',
  }
}

interface ContratsState {
  contrats: ContratItem[]
  loading: boolean
  error: string | null
  fetchContrats: (filter: { clientId?: string; freelanceId?: string }) => Promise<void>
}

export const useContratsStore = create<ContratsState>((set) => ({
  contrats: [],
  loading: false,
  error: null,

  fetchContrats: async (filter) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get<BackendContrat[]>('/contrats', { params: filter })
      set({ contrats: res.data.map(mapContrat), loading: false })
    } catch {
      set({ loading: false, error: 'Failed to load contracts' })
    }
  },
}))
