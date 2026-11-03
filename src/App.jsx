import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./components/AppLayout";
import { useAuth } from "./hooks/useAuth";
import ChannelsPage from "./pages/ChannelsPage";
import ContentDetailPage from "./pages/ContentDetailPage";
import ContentsPage from "./pages/ContentsPage";
import LandingPage from "./pages/LandingPage"; // <--- Import Landing Page lu
import LoginPage from "./pages/LoginPage";
import NewContentPage from "./pages/NewContentPage";
import RegisterPage from "./pages/RegisterPage";
import UsersPage from "./pages/UsersPage";

function ProtectedRoutes() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/contents" replace /> : children;
}

function RequireRole({ roles, children }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? (
    children
  ) : (
    <Navigate to="/contents" replace />
  );
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Route Publik Utama */}
        <Route path="/" element={<LandingPage />} />

        {/* Route Auth (Hanya untuk tamu / yang belum login) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* Route Private (Harus Login) */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/contents" element={<ContentsPage />} />
          <Route path="/contents/:id" element={<ContentDetailPage />} />
          <Route
            path="/contents/new"
            element={
              <RequireRole roles={["creator", "admin"]}>
                <NewContentPage />
              </RequireRole>
            }
          />
          <Route
            path="/channels"
            element={
              <RequireRole roles={["creator", "admin"]}>
                <ChannelsPage />
              </RequireRole>
            }
          />
          <Route
            path="/users"
            element={
              <RequireRole roles={["admin"]}>
                <UsersPage />
              </RequireRole>
            }
          />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
