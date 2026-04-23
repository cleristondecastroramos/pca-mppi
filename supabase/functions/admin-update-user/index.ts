import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) {
      return new Response(JSON.stringify({ error: "Missing config" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(url, serviceKey);

    const { data: userData, error: getUserError } = await supabaseUser.auth.getUser();
    if (getUserError) throw getUserError;
    const requester = userData?.user;
    if (!requester) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabaseUser.rpc("has_role", {
      _user_id: requester.id, _role: "administrador",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const { user_id, nome_completo, setor, setores_adicionais, cargo, role } = payload;

    if (!user_id) {
      console.error("user_id ausente no payload");
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Iniciando atualização para usuário ${user_id}...`);

    // Update profile
    const profileUpdate: Record<string, any> = {};
    if (nome_completo !== undefined) profileUpdate.nome_completo = nome_completo;
    if (setor !== undefined) profileUpdate.setor = setor;
    if (setores_adicionais !== undefined) profileUpdate.setores_adicionais = setores_adicionais;
    if (cargo !== undefined) profileUpdate.cargo = cargo;

    if (Object.keys(profileUpdate).length > 0) {
      console.log("Atualizando dados do perfil:", Object.keys(profileUpdate));
      const { error: profError } = await supabaseAdmin
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user_id);
      if (profError) {
        console.error("Erro ao atualizar profile:", profError.message);
        throw profError;
      }
      console.log("Perfil atualizado com sucesso.");
    }

    // Update role if provided (replace all roles with the new one)
    if (role) {
      console.log(`Atualizando role para '${role}'...`);
      const { error: delError } = await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      if (delError) {
        console.warn("Erro ao deletar roles antigas:", delError.message);
      }
      
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id, role });
      if (roleError) {
        console.error("Erro ao inserir nova role:", roleError.message);
        throw roleError;
      }
      console.log("Role atualizada com sucesso.");
    }

    console.log("Processo de atualização finalizado com sucesso.");

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
