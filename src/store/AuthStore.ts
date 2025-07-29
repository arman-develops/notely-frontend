import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState } from "../types/AuthState"
import type { User } from "../types/User"

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      token: null,

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      setAuth: (user: User, token: string) => {
        set({ user, token, isLoading: false, error: null })
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            hasCompletedOnboarding: false,
          }
          set({ user: newUser, isLoading: false })
        } catch (error) {
          set({ error: "Signup failed. Please try again.", isLoading: false })
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null })
        // Clear token from localStorage/sessionStorage if stored separately
        localStorage.removeItem("auth-token")
        localStorage.removeItem("notes-storage")
      },

      updateUser: (updates) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      },

      completeOnboarding: (preferences) => {
        const { user } = get()
        if (user) {
          set({
            user: {
              ...user,
              preferences,
              hasCompletedOnboarding: true,
            },
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)
