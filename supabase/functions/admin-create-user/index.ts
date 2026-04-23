// Edge Function: admin-create-user
// Cria/Convida usuário e atualiza perfil/role. Restrito a administradores.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      console.error("Missing env vars");
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized: no token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(url, serviceKey);

    // Verifica usuário autenticado e role administrador
    const { data: userData, error: getUserError } = await supabaseUser.auth.getUser();
    if (getUserError) {
      console.error("getUser error:", getUserError.message);
      return new Response(JSON.stringify({ error: "Auth error: " + getUserError.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
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

    console.log(`Iniciando processamento para ${email}. Role: ${role}. Senha: ${!!provisional_password}`);
    
    const payload = await req.json();
    const email: string | undefined = payload?.email;
    const nome_completo: string | undefined = payload?.nome_completo;
    const setor: string | undefined = payload?.setor;
    const setores_adicionais: string[] | undefined = payload?.setores_adicionais || [];
    const cargo: string | undefined = payload?.cargo;
    const role: string | undefined = payload?.role;
    const provisional_password: string | undefined = payload?.provisional_password;

    if (!email || !nome_completo || !isValidRole(role)) {
      console.error("Campos obrigatórios ausentes:", { email, nome_completo, role });
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, nome_completo, role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cria usuário com senha provisória, ou convida se não houver senha
    let newUser: any = null;
    if (provisional_password && provisional_password.length >= 8) {
      console.log("Tentando criar usuário com senha...");
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: provisional_password,
        email_confirm: true,
        user_metadata: { nome_completo },
      });
      if (signUpError) {
        console.error("Erro auth.admin.createUser:", signUpError.message);
        return new Response(JSON.stringify({ error: signUpError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      newUser = signUpData.user;
      console.log("Usuário criado via Auth Admin:", newUser.id);

      // Define que deve trocar senha no primeiro login
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(newUser.id, {
        user_metadata: { nome_completo, must_change_password: true },
      });
      if (updateErr) {
        console.warn("Erro ao definir must_change_password (não crítico):", updateErr.message);
      }
    } else {
      console.log("Tentando convidar usuário via e-mail...");
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { nome_completo },
      });
      if (inviteError) {
        console.error("Erro auth.admin.inviteUserByEmail:", inviteError.message);
        return new Response(JSON.stringify({ error: inviteError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      newUser = inviteData?.user;
      console.log("Usuário convidado via Auth Admin:", newUser?.id);
    }

    if (!newUser) {
      console.error("newUser é nulo após tentativa de criação/convite");
      return new Response(JSON.stringify({ error: "Failed to create user object" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Atualiza perfil com setor/cargo/nome (trigger handle_new_user já criou o profile)
    console.log("Atualizando perfil na tabela 'profiles'...");
    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .update({ nome_completo, setor, setores_adicionais, cargo, email })
      .eq("id", newUser.id);
    
    if (profileErr) {
      console.error("Erro ao atualizar profile:", profileErr.message);
      // Não retornamos erro aqui pois o usuário Auth já foi criado, 
      // mas registramos para debug.
    } else {
      console.log("Perfil atualizado com sucesso.");
    }

    // Atribui perfil de acesso escolhido (remove o role padrão do trigger)
    console.log(`Atribuindo role '${role}' ao usuário ${newUser.id}...`);
    const { error: delRoleErr } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", newUser.id);
    
    if (delRoleErr) {
      console.warn("Erro ao remover roles antigas (não crítico):", delRoleErr.message);
    }

    const { error: insRoleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.id, role });
    
    if (insRoleErr) {
      console.error("Erro ao inserir nova role:", insRoleErr.message);
      return new Response(JSON.stringify({ error: "User created but role assignment failed: " + insRoleErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processo de criação finalizado com sucesso.");

    return new Response(
      JSON.stringify({ ok: true, id: newUser.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Unhandled error:", e?.message || String(e));
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
