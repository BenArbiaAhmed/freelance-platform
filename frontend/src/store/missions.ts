import { create } from 'zustand'
import { graphqlRequest } from '@/lib/api'
import { mapMission, type GqlMissionItem } from '@/lib/mappers'
import type { Mission } from '@/lib/mock-data'

const SEARCH_MISSIONS = `
  query SearchMissions($pagination: PaginationInput) {
    searchMissions(pagination: $pagination) {
      items {
        id titre description budget deadline statut competencesRequises dateCreation
        client { entreprise user { nom photo } }
      }
    }
  }
`

interface MissionsState {
  missions: Mission[]
  loading: boolean
  error: string | null
  loaded: boolean
  fetchMissions: () => Promise<void>
}

export const useMissionsStore = create<MissionsState>((set) => ({
  missions: [],
  loading: false,
  error: null,
  loaded: false,

  fetchMissions: async () => {
    set({ loading: true, error: null })
    try {
      const data = await graphqlRequest<{ searchMissions: { items: GqlMissionItem[] } }>(
        SEARCH_MISSIONS,
        { pagination: { page: 1, limit: 100 } },
      )
      set({ missions: data.searchMissions.items.map(mapMission), loading: false, loaded: true })
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load missions' })
    }
  },
}))
