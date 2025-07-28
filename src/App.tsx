import { Route, Routes } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import OnboardingFlow from "./pages/Onboarding"
import ProtectedRoute from "./components/ProtectedRoutes"
import DashboardLayout from './layout/DashboardLayout';
import DashboardPage from "./pages/Dashboard"
import NewNotePage from "./pages/NewNotePage"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />
      <Route
        path="/app/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="notes/new" element={<NewNotePage />} />
        {/* <Route path="notes" element={<AllNotesPage />} />
        
        <Route path="notes/view/:id" element={<ViewNotePage />} /> */}
        {/* Add more nested routes here */}
      </Route>
    </Routes>
  )
}

export default App
