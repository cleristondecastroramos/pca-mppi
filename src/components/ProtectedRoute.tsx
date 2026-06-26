import { Navigate, useLocation } from "react-router-dom";
import { useUserRoles, hasAnyRole, PerfilAcesso, useAuthSession, useUserProfile } from "@/lib/auth";
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
  const { data: profile, isLoading: profileLoading } = useUserProfile(userId);
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

  // Sessão existe, aguardando roles e perfil
  if (rolesLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-full py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando permissões...
      </div>
    );
  }

  // Tem sessão mas sem permissão de role
  if (!hasAnyRole(roles, allowed)) { 
    return <Navigate to="/acesso-negado" replace />;
  }

  // Se estiver na tela de seleção de exercício, não há necessidade de verificar o exercício selecionado
  if (location.pathname === "/selecao-exercicio") {
    return <>{children}</>;
  }

  // Se não houver exercício selecionado, redirecionar para a tela de escolha
  const exerciseSelected = localStorage.getItem("pca_exercicio");
  if (!exerciseSelected) {
    return <Navigate to="/selecao-exercicio" replace />;
  }

  // Validar permissão para o exercício selecionado
  const activeExercise = parseInt(exerciseSelected, 10);
  const exerciciosPermitidos = (profile as any)?.exercicios_permitidos || [2026];

  if (!exerciciosPermitidos.includes(activeExercise)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}
