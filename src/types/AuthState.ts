import type { User } from "./User"

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  token: string | null

  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setAuth: (user: User, token: string) => void
  signup: (userData: Omit<User, "id" | "hasCompletedOnboarding">) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  completeOnboarding: (preferences: string[]) => void
  clearError: () => void
}
