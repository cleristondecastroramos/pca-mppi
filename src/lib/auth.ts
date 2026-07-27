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

export function useAuthSession() {
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        queryClient.setQueryData(["auth", "session"], data.session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        queryClient.setQueryData(["auth", "session"], session);
      }
    );
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 60_000,
    retry: false,
  });
}

export async function fetchUserRoles(userId?: string): Promise<PerfilAcesso[]> {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data.map(r => r.role as PerfilAcesso);
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
    let id = userId;
    if (!id) {
      const { data } = await supabase.auth.getSession();
      id = data.session?.user?.id;
    }
    if (!id) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome_completo, setor, setores_adicionais, cargo, email, exercicios_permitidos, must_change_password, unidade_requisitante_id, unidades_requisitantes(nome)")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) return data;

    const { data: fallbackData } = await supabase
      .from("profiles")
      .select("id, nome_completo, setor, setores_adicionais, cargo, email, exercicios_permitidos, must_change_password, unidade_requisitante_id")
      .eq("id", id)
      .maybeSingle();

    return fallbackData;
  } catch {
    return null;
  }
}

export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: ["auth", "profile", userId ?? "anonymous"],
    queryFn: () => fetchUserProfile(userId),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!userId,
  });
}

export function hasAnyRole(roles: PerfilAcesso[] | undefined, allowed: PerfilAcesso[]) {
  if (!roles || roles.length === 0) return false;
  return roles.some((r) => allowed.includes(r));
}
