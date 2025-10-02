import { Navigate, useLocation } from "react-router-dom";
import { useUserRoles, hasAnyRole, PerfilAcesso } from "@/lib/auth";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowed: PerfilAcesso[];
  redirectTo?: string;
};

export default function ProtectedRoute({ children, allowed, redirectTo = "/dashboard" }: ProtectedRouteProps) {
  const { data: roles, isLoading } = useUserRoles();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Carregando permissões...
      </div>
    );
  }

  const allowedAccess = hasAnyRole(roles, allowed);
  if (!allowedAccess) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}