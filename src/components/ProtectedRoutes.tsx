import type React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    !user.hasCompletedOnboarding &&
    window.location.pathname !== "/app/onboarding"
  ) {
    return <Navigate to="/app/onboarding" replace />;
  }

  if (
    user.hasCompletedOnboarding &&
    window.location.pathname === "/app/onboarding"
  ) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
