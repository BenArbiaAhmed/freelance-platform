import { create } from 'zustand'
import { graphqlRequest } from '@/lib/api'
import { mapMission, type GqlMissionItem } from '@/lib/mappers'
import type { Mission } from '@/lib/mock-data'

export type MissionSortField = 'TITRE' | 'BUDGET' | 'DEADLINE' | 'DATE_CREATION'
export type SortDirection = 'ASC' | 'DESC'

export interface MissionQuery {
  keyword?: string
  skills?: string[]
  sortField?: MissionSortField
  sortDirection?: SortDirection
}

const SEARCH_MISSIONS = `
  query SearchMissions(
    $filter: MissionFilterInput
    $sort: MissionSortInput
    $pagination: PaginationInput
  ) {
    searchMissions(filter: $filter, sort: $sort, pagination: $pagination) {
      items {
        id titre description budget deadline statut competencesRequises dateCreation
        client { entreprise user { nom photo } }
      }
    }
  }
`

interface MissionsState {
  missions: Mission[]
  // Stable union of every required skill seen across fetches, so filter chips
  // don't collapse as server-side filters narrow the result set.
  allSkills: string[]
  loading: boolean
  error: string | null
  loaded: boolean
  fetchMissions: (query?: MissionQuery) => Promise<void>
}

export const useMissionsStore = create<MissionsState>((set) => ({
  missions: [],
  allSkills: [],
  loading: false,
  error: null,
  loaded: false,

  fetchMissions: async (query = {}) => {
    set({ loading: true, error: null })
    try {
      const filter = {
        ...(query.keyword?.trim() ? { keyword: query.keyword.trim() } : {}),
        ...(query.skills?.length ? { competences: query.skills } : {}),
      }
      const data = await graphqlRequest<{
        searchMissions: { items: GqlMissionItem[] }
      }>(SEARCH_MISSIONS, {
        filter: Object.keys(filter).length ? filter : undefined,
        sort: {
          field: query.sortField ?? 'DATE_CREATION',
          direction: query.sortDirection ?? 'DESC',
        },
        pagination: { page: 1, limit: 100 },
      })
      const missions = data.searchMissions.items.map(mapMission)
      set((state) => ({
        missions,
        allSkills: Array.from(
          new Set([...state.allSkills, ...missions.flatMap((m) => m.competencesRequises)]),
        ).sort(),
        loading: false,
        loaded: true,
      }))
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load missions',
      })
    }
  },
}))
