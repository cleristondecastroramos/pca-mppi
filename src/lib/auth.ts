import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

export type PerfilAcesso = "administrador" | "gestor" | "setor_requisitante" | "consulta";

export const SETORES_REQUISITANTES = [
  "Administração Superior", "CAA", "CCF", "CCS", "CEAF", "CLC", "CONINT", "CPPT", "CRH", "CTI", "GAECO", "GSI", "PLANEJAMENTO", "PROCON",
] as const;

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Validates the session server-side using getUser().
 * Returns the session only if the token is still valid on the server.
 */
async function getValidatedSession(): Promise<Session | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return null;

  // Validate the token server-side
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) {
    // Token is invalid/expired - sign out to clear stale session
    await supabase.auth.signOut();
    return null;
  }

  return session;
}

export function useAuthSession() {
  const queryClient = useQueryClient();

  // Listen for auth state changes and update the query cache reactively
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        queryClient.setQueryData(["auth", "session"], session);
      }
    );
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => getValidatedSession(),
    staleTime: 30_000, // revalidate every 30s
    refetchOnMount: "always",
    refetchOnReconnect: true,
    retry: false,
  });
}

export async function fetchUserRoles(userId?: string): Promise<PerfilAcesso[]> {
  try {
    const uid = userId;
    const id = uid ?? (await getSession())?.user?.id;
    if (!id) return [];

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", id);

    if (error) {
      console.error("Erro ao buscar roles:", error);
      return [];
    }
    let roles: PerfilAcesso[] = (data || []).map((r: { role: PerfilAcesso }) => r.role);

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

export function useUserRoles(userId?: string) {
  return useQuery({
    queryKey: ["auth", "roles", userId ?? "anonymous"],
    queryFn: () => fetchUserRoles(userId),
    staleTime: 120_000,
    enabled: !!userId,
  });
}

export async function fetchUserProfile(userId?: string) {
  try {
    const id = userId ?? (await getSession())?.user?.id;
    if (!id) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome_completo, setor, cargo, email")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: ["auth", "profile", userId ?? "anonymous"],
    queryFn: () => fetchUserProfile(userId),
    staleTime: 120_000,
    enabled: !!userId,
  });
}

export function hasAnyRole(roles: PerfilAcesso[] | undefined, allowed: PerfilAcesso[]) {
  if (!roles || roles.length === 0) return false;
  return roles.some((r) => allowed.includes(r));
}
