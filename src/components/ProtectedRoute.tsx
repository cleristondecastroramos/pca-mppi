import { Navigate, useLocation } from "react-router-dom";
import { useUserRoles, hasAnyRole, PerfilAcesso, useAuthSession, useUserProfile } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { ForcePasswordChange } from "./ForcePasswordChange";
import { isPca2027LockedForRoles } from "@/config/pca2027Lock";

const PCA_2027_ROUTES = ["/planejamento", "/nova-demanda"];

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

  // -----------------------------------------------------------------------
  // VERIFICAÇÃO DUPLA de troca de senha obrigatória:
  //
  // Fonte 1: JWT (user_metadata) — gravado pela Edge Function admin-create-user
  //          Disponível IMEDIATAMENTE, sem depender de query ao banco.
  //
  // Fonte 2: profiles.must_change_password — gravado pelo admin via SQL
  //          ou pela própria Edge Function na tabela profiles.
  //
  // Se QUALQUER UMA das fontes indicar must_change_password = true,
  // o acesso é bloqueado até que a senha seja trocada.
  // -----------------------------------------------------------------------
  const mustChangeFromJwt = session?.user?.user_metadata?.must_change_password === true;
  const mustChangeFromProfile = profile?.must_change_password === true;
  const mustChangePassword = mustChangeFromJwt || mustChangeFromProfile;

  // Log de diagnóstico (remover após confirmar o funcionamento)
  if (import.meta.env.DEV) {
    console.log("[ProtectedRoute] must_change_password check:", {
      userId,
      mustChangeFromJwt,
      mustChangeFromProfile,
      mustChangePassword,
      userMetadata: session?.user?.user_metadata,
      profileData: profile,
    });
  }

  if (mustChangePassword) {
    const isSetorRequisitante = roles?.includes("setor_requisitante") && !roles?.includes("administrador") && !roles?.includes("gestor");
    return <ForcePasswordChange onSuccess={() => window.location.reload()} userId={userId!} isSetorRequisitante={isSetorRequisitante} />;
  }

  // Tem sessão mas sem permissão de role
  if (!hasAnyRole(roles, allowed)) { 
    return <Navigate to="/acesso-negado" replace />;
  }

  // Se estiver na tela de seleção de exercício, não há necessidade de verificar o exercício selecionado
  if (location.pathname === "/selecao-exercicio") {
    return <>{children}</>;
  }

  // Trava provisória do módulo PCA 2027 (ver src/config/pca2027Lock.ts)
  const pca2027Locked = isPca2027LockedForRoles(roles);

  // Se não houver exercício selecionado, verifica se pode auto-selecionar
  const exerciseSelected = localStorage.getItem("pca_exercicio");
  if (!exerciseSelected) {
    const exerciciosDoUsuario: number[] = (profile as any)?.exercicios_permitidos ?? [];

    // Usuário com acesso a apenas UM exercício: auto-seleciona e redireciona direto
    if (exerciciosDoUsuario.length === 1) {
      const unico = exerciciosDoUsuario[0];
      if (unico === 2027 && pca2027Locked) {
        return <Navigate to="/pca-2027-indisponivel" replace />;
      }
      localStorage.setItem("pca_exercicio", String(unico));
      const isSetorRequisitante = roles?.includes("setor_requisitante") && !roles?.includes("administrador") && !roles?.includes("gestor");
      const dest2027 = isSetorRequisitante ? "/nova-demanda" : "/planejamento";
      return <Navigate to={unico === 2026 ? "/visao-geral" : dest2027} replace />;
    }

    // Múltiplos exercícios: exibe tela de seleção
    return <Navigate to="/selecao-exercicio" replace />;
  }

  // Validar permissão para o exercício selecionado
  const activeExercise = parseInt(exerciseSelected, 10);
  const exerciciosPermitidos = (profile as any)?.exercicios_permitidos || [2026];

  if (!exerciciosPermitidos.includes(activeExercise)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  // Bloqueio de rotas 2027 durante a trava provisória
  if (pca2027Locked && PCA_2027_ROUTES.includes(location.pathname)) {
    return <Navigate to="/pca-2027-indisponivel" replace />;
  }

  return <>{children}</>;
}
