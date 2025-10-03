import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserRoles, hasAnyRole, PerfilAcesso, getSession } from "@/lib/auth";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowed: PerfilAcesso[];
  redirectTo?: string; // rota para onde redirecionar quando não autorizado
};

export default function ProtectedRoute({ children, allowed, redirectTo = "/auth" }: ProtectedRouteProps) {
  const { data: roles, isLoading } = useUserRoles();
  const location = useLocation();
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);

  useEffect(() => {
    // Detecta sessão para evitar loop de redirecionamento quando usuário está logado mas sem roles
    getSession().then((s) => {
      setHasSession(!!s);
      setSessionChecked(true);
    });
  }, []);

  if (isLoading || !sessionChecked) {
    return (
      <div className="flex items-center justify-center h-full py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando permissões...
      </div>
    );
  }

  const allowedAccess = hasAnyRole(roles, allowed);
  if (!allowedAccess) {
    // Se usuário está autenticado mas sem roles, evita loop e mostra mensagem de acesso negado
    if (hasSession) {
      return (
        <div className="flex items-center justify-center h-full py-10 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5" />
          Seu usuário não possui permissão para acessar esta página. Contate o administrador.
        </div>
      );
    }
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}