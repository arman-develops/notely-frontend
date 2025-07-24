import type { User } from "./User"

export interface AuthState {
    user: User | null
    isLoading: boolean
    error: string | null
    login: (identifier: string, password: string) => Promise<void>
    signup: (userData: Omit<User, "id" | "hasCompletedOnboarding">) => Promise<void>
    logout: () => void
    updateUser: (updates: Partial<User>) => void
    completeOnboarding: (preferences: string[]) => void
    clearError: () => void
}