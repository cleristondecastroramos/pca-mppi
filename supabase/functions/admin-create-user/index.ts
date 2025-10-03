// Edge Function: admin-create-user
// Cria/Convida usuário e atualiza perfil/role. Restrito a administradores.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PerfilAcesso = "administrador" | "gestor" | "setor_requisitante" | "consulta";

function isValidRole(role: string | undefined): role is PerfilAcesso {
  return (
    role === "administrador" ||
    role === "gestor" ||
    role === "setor_requisitante" ||
    role === "consulta"
  );
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
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabaseUser.rpc("has_role", {
      _user_id: requester.id,
      _role: "administrador",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const email: string | undefined = payload?.email;
    const nome_completo: string | undefined = payload?.nome_completo;
    const setor: string | undefined = payload?.setor;
    const cargo: string | undefined = payload?.cargo;
    const role: string | undefined = payload?.role;
    const provisional_password: string | undefined = payload?.provisional_password; // opcional

    if (!email || !nome_completo || !isValidRole(role)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, nome_completo, role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cria usuário com senha provisória, ou convida se não houver senha
    let newUser: any = null;
    if (provisional_password && provisional_password.length >= 8) {
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: provisional_password,
        email_confirm: true, // marca e-mail como confirmado; pode ajustar conforme política
        user_metadata: { nome_completo },
      });
      if (signUpError) {
        return new Response(JSON.stringify({ error: signUpError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      newUser = signUpData.user;
      // Define que deve trocar senha no primeiro login (metadata)
      await supabaseAdmin.auth.admin.updateUserById(newUser.id, {
        user_metadata: { must_change_password: true },
      });
    } else {
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { nome_completo },
      });
      if (inviteError) {
        return new Response(JSON.stringify({ error: inviteError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      newUser = inviteData?.user;
    }
    if (!newUser) {
      return new Response(JSON.stringify({ error: "Failed to create user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Atualiza perfil com setor/cargo/nome
    await supabaseAdmin
      .from("profiles")
      .update({ nome_completo, setor, cargo, email })
      .eq("id", newUser.id);

    // Atribui perfil de acesso escolhido
    await supabaseAdmin.from("user_roles").insert({ user_id: newUser.id, role });

    return new Response(
      JSON.stringify({ ok: true, id: newUser.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});