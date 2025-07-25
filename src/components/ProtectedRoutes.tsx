import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/AuthStore"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.hasCompletedOnboarding && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />
  }

  if (user.hasCompletedOnboarding && window.location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}