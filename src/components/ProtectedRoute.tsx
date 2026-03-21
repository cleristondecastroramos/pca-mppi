import { Navigate, useLocation } from "react-router-dom";
import { useUserRoles, hasAnyRole, PerfilAcesso, useAuthSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowed: PerfilAcesso[];
  redirectTo?: string;
};

export default function ProtectedRoute({ children, allowed, redirectTo = "/auth" }: ProtectedRouteProps) {
  const { data: session, isLoading: sessionLoading } = useAuthSession();
  const userId = session?.user?.id;
  const { data: roles, isLoading: rolesLoading } = useUserRoles(userId);
  const location = useLocation();

  // Ainda carregando sessão
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-full py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando...
      </div>
    );
  }

  // Sem sessão → redireciona para login
  if (!session) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Sessão existe, aguardando roles
  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center h-full py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando permissões...
      </div>
    );
  }

  // Tem sessão mas sem permissão
  if (!hasAnyRole(roles, allowed)) { 
    return (
      <div className="flex items-center justify-center h-full py-10 text-muted-foreground">
        Seu usuário não possui permissão para acessar esta página. Contate o administrador.
      </div>
    );
  }

  return <>{children}</>;
}
