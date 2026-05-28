import { create } from 'zustand'
import { graphqlRequest } from '@/lib/api'
import { mapFreelancer, type GqlFreelancerItem } from '@/lib/mappers'
import type { FreelanceProfile } from '@/lib/mock-data'

const SEARCH_FREELANCERS = `
  query SearchFreelancers($pagination: PaginationInput) {
    searchFreelanceProfiles(pagination: $pagination) {
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
  loading: boolean
  error: string | null
  loaded: boolean
  fetchFreelancers: () => Promise<void>
}

export const useFreelancersStore = create<FreelancersState>((set) => ({
  freelancers: [],
  loading: false,
  error: null,
  loaded: false,

  fetchFreelancers: async () => {
    set({ loading: true, error: null })
    try {
      const data = await graphqlRequest<{ searchFreelanceProfiles: { items: GqlFreelancerItem[] } }>(
        SEARCH_FREELANCERS,
        { pagination: { page: 1, limit: 100 } },
      )
      set({
        freelancers: data.searchFreelanceProfiles.items.map(mapFreelancer),
        loading: false,
        loaded: true,
      })
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load freelancers' })
    }
  },
}))
