import { create } from 'zustand'
import { graphqlRequest } from '@/lib/api'
import { mapFreelancer, type GqlFreelancerItem } from '@/lib/mappers'
import type { FreelanceProfile } from '@/lib/mock-data'

export type FreelancerSortField = 'NOM' | 'RATING' | 'TARIF_JOURNALIER'
export type SortDirection = 'ASC' | 'DESC'

export interface FreelancerQuery {
  keyword?: string
  skills?: string[]
  disponible?: boolean
  sortField?: FreelancerSortField
  sortDirection?: SortDirection
}

const SEARCH_FREELANCERS = `
  query SearchFreelancers(
    $filter: FreelanceProfileFilterInput
    $sort: FreelanceProfileSortInput
    $pagination: PaginationInput
  ) {
    searchFreelanceProfiles(filter: $filter, sort: $sort, pagination: $pagination) {
      items {
        id tarifJournalier disponible rating
        user { nom photo bio }
        competences { niveau competence { nom } }
      }
    }
  }
`

interface FreelancersState {
  freelancers: FreelanceProfile[]
  // Stable union of every skill seen across fetches, so filter chips don't
  // collapse as server-side filters narrow the result set.
  allSkills: string[]
  loading: boolean
  error: string | null
  loaded: boolean
  fetchFreelancers: (query?: FreelancerQuery) => Promise<void>
}

export const useFreelancersStore = create<FreelancersState>((set) => ({
  freelancers: [],
  allSkills: [],
  loading: false,
  error: null,
  loaded: false,

  fetchFreelancers: async (query = {}) => {
    set({ loading: true, error: null })
    try {
      const filter = {
        ...(query.keyword?.trim() ? { keyword: query.keyword.trim() } : {}),
        ...(query.skills?.length ? { competenceNames: query.skills } : {}),
        ...(query.disponible ? { disponible: true } : {}),
      }
      const data = await graphqlRequest<{
        searchFreelanceProfiles: { items: GqlFreelancerItem[] }
      }>(SEARCH_FREELANCERS, {
        filter: Object.keys(filter).length ? filter : undefined,
        sort: {
          field: query.sortField ?? 'RATING',
          direction: query.sortDirection ?? 'DESC',
        },
        pagination: { page: 1, limit: 100 },
      })
      const freelancers = data.searchFreelanceProfiles.items.map(mapFreelancer)
      set((state) => ({
        freelancers,
        allSkills: Array.from(
          new Set([
            ...state.allSkills,
            ...freelancers.flatMap((f) => f.competences.map((c) => c.nom)),
          ]),
        ).sort(),
        loading: false,
        loaded: true,
      }))
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load freelancers',
      })
    }
  },
}))
