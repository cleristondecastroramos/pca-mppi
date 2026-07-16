// Edge Function: admin-delete-user
// Exclui usuário do auth (cascade remove profiles/user_roles). Restrito a administradores.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stringifyError(error: unknown): string {
  if (!error) return "Erro desconhecido";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || String(error);
  if (typeof error === "object") {
    const value = error as Record<string, unknown>;
    const parts = [value.message, value.details, value.hint, value.code]
      .filter(Boolean)
      .map(String);
    if (parts.length) return parts.join(" | ");
    try {
      return JSON.stringify(value);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

async function countRows(
  supabaseAdmin: ReturnType<typeof createClient>,
  table: string,
  column: string,
  userId: string,
) {
  const { count, error } = await supabaseAdmin
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, userId);

  if (error) throw error;
  return count ?? 0;
}

async function clearNullableReferences(
  supabaseAdmin: ReturnType<typeof createClient>,
  table: string,
  column: string,
  userId: string,
) {
  const { error } = await supabaseAdmin
    .from(table)
    .update({ [column]: null })
    .eq(column, userId);

  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) {
      return jsonResponse({ error: "Missing Supabase environment configuration" });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(url, serviceKey);

    // Verifica usuário autenticado e role administrador
    const { data: userData, error: getUserError } = await supabaseUser.auth.getUser();
    if (getUserError) throw getUserError;
    const requester = userData?.user;
    if (!requester) {
      return jsonResponse({ error: "Unauthorized" });
    }

    const { data: isAdmin, error: roleError } = await supabaseUser.rpc("has_role", {
      _user_id: requester.id,
      _role: "administrador",
    });
    if (roleError) throw roleError;
    if (!isAdmin) {
      return jsonResponse({ error: "Forbidden" });
    }

    const payload = await req.json();
    const user_id: string | undefined = payload?.user_id;
    if (!user_id) {
      return jsonResponse({ error: "Missing user_id" });
    }

    const blockingDependencies = [
      {
        table: "contratacoes_historico",
        column: "user_id",
        label: "histórico de contratações",
      },
    ];

    const blockers = [];
    for (const dependency of blockingDependencies) {
      const count = await countRows(supabaseAdmin, dependency.table, dependency.column, user_id);
      if (count > 0) {
        blockers.push({ ...dependency, count });
      }
    }

    if (blockers.length > 0) {
      const details = blockers
        .map((item) => `${item.count} registro(s) em ${item.label}`)
        .join("; ");

      return jsonResponse({
        error: `Não é possível excluir este usuário porque ele possui vínculo com ${details}. Para preservar a trilha de auditoria do PCA, mantenha o usuário cadastrado ou remova/reatribua esses vínculos antes da exclusão.`,
        code: "USER_HAS_DEPENDENCIES",
        dependencies: blockers,
      });
    }

    const nullableReferences = [
      { table: "catalogo_interno", column: "created_by" },
      { table: "catalogo_interno", column: "updated_by" },
      { table: "contratacoes", column: "created_by" },
      { table: "contratacoes", column: "updated_by" },
      { table: "etapas_status", column: "responsavel_id" },
    ];

    for (const reference of nullableReferences) {
      await clearNullableReferences(supabaseAdmin, reference.table, reference.column, user_id);
    }

    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (delError) {
      const message = stringifyError(delError);
      console.error("Erro ao excluir usuário no Auth:", message);
      return jsonResponse({
        error: message === "Database error deleting user"
          ? "Não foi possível excluir o usuário porque ainda há registros vinculados a ele no banco de dados. Verifique contratos, catálogo, etapas ou histórico vinculados antes de tentar novamente."
          : message,
        code: "AUTH_DELETE_FAILED",
        details: message,
      });
    }

    // Remove registros associados em profiles e user_roles
    await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
    await supabaseAdmin.from("profiles").delete().eq("id", user_id);

    return jsonResponse({ ok: true });
  } catch (e: any) {
    const message = stringifyError(e);
    console.error("Erro inesperado em admin-delete-user:", message);
    return jsonResponse({ error: message, code: "UNEXPECTED_DELETE_ERROR" });
  }
});