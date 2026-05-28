import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setAuthToken, AUTH_STORAGE_KEY, apiErrorMessage } from '@/lib/api'

export type UserRole = 'admin' | 'client' | 'freelance'

export interface FreelanceProfileRef {
  id: string
  tarifJournalier: number | null
  disponible: boolean
  rating: number
}

export interface ClientProfileRef {
  id: string
  entreprise: string | null
  siteWeb: string | null
}

export interface AuthUser {
  id: string
  nom: string
  email: string
  role: UserRole
  photo?: string | null
  bio?: string | null
  dateCreation?: string
  freelanceProfile?: FreelanceProfileRef | null
  clientProfile?: ClientProfileRef | null
}

interface AuthResult {
  accessToken: string
  user: AuthUser
}

export interface RegisterInput {
  nom: string
  email: string
  motDePasse: string
  role: 'client' | 'freelance'
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (email: string, motDePasse: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  loadProfile: () => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      login: async (email, motDePasse) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<AuthResult>('/auth/login', { email, motDePasse })
          setAuthToken(data.accessToken)
          set({ token: data.accessToken, user: data.user, loading: false })
          await get().loadProfile()
        } catch (err) {
          set({ loading: false, error: apiErrorMessage(err, 'Invalid email or password') })
          throw err
        }
      },

      register: async (input) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post<AuthResult>('/auth/register', input)
          setAuthToken(data.accessToken)
          set({ token: data.accessToken, user: data.user, loading: false })
          await get().loadProfile()
        } catch (err) {
          set({ loading: false, error: apiErrorMessage(err, 'Could not create account') })
          throw err
        }
      },

      // Fetches the full user (incl. freelance/client profile ids) which the
      // login/register responses don't include but mutations need.
      loadProfile: async () => {
        const { user } = get()
        if (!user) return
        try {
          const { data } = await api.get<AuthUser>(`/users/${user.id}`)
          set({ user: { ...get().user, ...data } })
        } catch {
          // Non-fatal: keep the basic user from the auth response.
        }
      },

      logout: () => {
        setAuthToken(null)
        set({ token: null, user: null, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token)
      },
    },
  ),
)
