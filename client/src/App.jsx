import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AuthSuccess from "./pages/AuthSuccess";
import DashboardPage from "./pages/DashboardPage";
import LeaderboardPage from "./pages/LeaderboardPage";
// import NotificationsPage from "./pages/NotificationsPage";
// import AnalyticsPage from "./pages/AnalyticsPage";
import AdminPage from "./pages/AdminPage";

import ChatBot from "./components/ChatBot";
import useAuthStore from "./store/useAuthStore";

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function Boot() {
  const { token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Boot />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth-success" element={<AuthSuccess />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        /> */}

        {/* <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ChatBot />
    </BrowserRouter>
  );
}