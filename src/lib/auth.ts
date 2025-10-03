import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PerfilAcesso = "administrador" | "gestor" | "setor_requisitante" | "consulta";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function fetchUserRoles(userId?: string): Promise<PerfilAcesso[]> {
  try {
    const uid = userId;
    const id = uid ?? (await getSession())?.user?.id;
    if (!id) return [];

    // Query only user_roles table as single source of truth
    const { data, error } = (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", id);

    if (error) {
      console.error("Erro ao buscar roles:", error);
      return [];
    }
    let roles: PerfilAcesso[] = (data || []).map((r: { role: PerfilAcesso }) => r.role);

    // Fallback: se e-mail do usuário corresponder ao admin padrão, garante perfil administrador
    const defaultAdminEmail = import.meta.env.VITE_DEFAULT_ADMIN_EMAIL as string | undefined;
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData.session?.user?.email;
    if (defaultAdminEmail && email && email.toLowerCase() === defaultAdminEmail.toLowerCase()) {
      if (!roles.includes("administrador")) roles = [...roles, "administrador"];
    }

    return roles;
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