import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState } from "../types/authState"
import type { User } from "../types/User"

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null })

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Mock user data - in real app, this would come from your API
          const mockUser: User = {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            username: "johndoe",
            email: email,
            preferences: ["tech", "travel"],
            hasCompletedOnboarding: true,
            bio: "Love taking notes and organizing my thoughts!",
          }

          set({ user: mockUser, isLoading: false })
        } catch (error) {
          set({ error: "Login failed. Please try again.", isLoading: false })
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null })

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const newUser: User = {
            ...userData,
            id: Date.now().toString(), // In real app, this would come from your API
            hasCompletedOnboarding: false,
          }

          set({ user: newUser, isLoading: false })
        } catch (error) {
          set({ error: "Signup failed. Please try again.", isLoading: false })
        }
      },

      logout: () => {
        set({ user: null, error: null })
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
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
