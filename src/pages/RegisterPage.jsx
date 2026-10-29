import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthShell from "@/components/AuthShell";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  const { user } = useAuth();

  // Jika user sudah login, lempar langsung ke /contents
  if (user) return <Navigate to="/contents" replace />;

  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}