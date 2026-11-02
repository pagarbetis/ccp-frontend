import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthShell from "@/components/AuthShell";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/contents" replace />;

  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}