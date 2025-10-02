import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PerfilAcesso = "administrador" | "gestor" | "setor_requisitante" | "consulta";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

async function rolesFromUserMetadata(): Promise<PerfilAcesso[]> {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return [];

    const meta: any = user.user_metadata || {};
    const appMeta: any = (user as any).app_metadata || {};

    // Common keys that might store roles
    const rawRole = meta.perfil_acesso || meta.role || appMeta.role;
    const rawRoles = meta.roles || appMeta.roles;

    if (Array.isArray(rawRoles) && rawRoles.length) {
      return rawRoles.filter((r): r is PerfilAcesso => [
        "administrador",
        "gestor",
        "setor_requisitante",
        "consulta",
      ].includes(r));
    }

    if (typeof rawRole === "string" && rawRole.length) {
      const r = rawRole as PerfilAcesso;
      if (["administrador", "gestor", "setor_requisitante", "consulta"].includes(r)) {
        return [r];
      }
    }
    return [];
  } catch (e) {
    console.warn("Falha ao ler user_metadata:", e);
    return [];
  }
}

export async function fetchUserRoles(userId?: string): Promise<PerfilAcesso[]> {
  try {
    // Primeiro tenta via user_metadata
    const metaRoles = await rolesFromUserMetadata();
    if (metaRoles.length) return metaRoles;

    const uid = userId;
    const id = uid ?? (await getSession())?.user?.id;
    if (!id) return [];

    // Using any to avoid type issues for new tables not in generated types
    const { data, error } = (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", id);

    if (error) {
      console.error("Erro ao buscar roles:", error);
      return [];
    }
    return (data || []).map((r: { role: PerfilAcesso }) => r.role);
  } catch (e) {
    console.error("Falha ao obter roles:", e);
    return [];
  }
}

export function useUserRoles() {
  return useQuery({
    queryKey: ["auth", "roles"],
    queryFn: () => fetchUserRoles(),
    staleTime: 60_000,
  });
}

export function hasAnyRole(roles: PerfilAcesso[] | undefined, allowed: PerfilAcesso[]) {
  if (!roles || roles.length === 0) return false;
  return roles.some((r) => allowed.includes(r));
}