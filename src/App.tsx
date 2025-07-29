import { Route, Routes } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import OnboardingFlow from "./pages/Onboarding"
import ProtectedRoute from "./components/ProtectedRoutes"
import DashboardLayout from './layout/DashboardLayout';
import DashboardPage from "./pages/Dashboard"
import NewNotePage from "./pages/NewNotePage"
import AllNotesPage from "./pages/AllNotesPage"
import ViewNotePage from "./pages/ViewNotePage"
import TrashPage from "./pages/TrashPage"
import PinnedNotesPage from "./pages/PinnedNotesPage"
import BookmarkedNotesPage from "./pages/BookMarkedNotesPage"
import ProfilePage from "./pages/ProfilePage"
import LandingPage from "./pages/LandingPage"
import EditNotePage from "./pages/EditNotesPage"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
            path="/app/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingFlow />
              </ProtectedRoute>
            }
        />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="notes/new" element={<NewNotePage />} />
        <Route path="notes" element={<AllNotesPage />} />
        <Route path="notes/view/:id" element={<ViewNotePage />} />
        <Route path="notes/edit/:id" element={<EditNotePage />} />
        <Route path="notes/trash" element={<TrashPage />} />
        <Route path="notes/pinned" element={<PinnedNotesPage />} />
        <Route path="notes/bookmarked" element={<BookmarkedNotesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default App
