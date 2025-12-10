// Edge Function: admin-seed
// Gera dados provisórios: cria usuários e contratações. Restrito a administradores.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PerfilAcesso = "administrador" | "gestor" | "setor_requisitante" | "consulta";

type SeedUser = {
  email: string;
  nome_completo: string;
  setor: string;
  cargo: string;
  role: PerfilAcesso;
};

type SeedConfig = {
  users?: SeedUser[];
  create_contratacoes?: boolean;
};

const DEFAULT_USERS: SeedUser[] = [
  { email: "admin2@example.com", nome_completo: "Admin Secundário", setor: "CTI", cargo: "Administrador", role: "administrador" },
  { email: "gestor@example.com", nome_completo: "Gestor de Compras", setor: "PLANEJAMENTO", cargo: "Gestor", role: "gestor" },
  { email: "requisitante.cti@example.com", nome_completo: "Requisitante CTI", setor: "CTI", cargo: "Analista", role: "setor_requisitante" },
  { email: "requisitante.caa@example.com", nome_completo: "Requisitante CAA", setor: "CAA", cargo: "Assistente", role: "setor_requisitante" },
  { email: "consulta@example.com", nome_completo: "Usuário Consulta", setor: "CLC", cargo: "Servidor", role: "consulta" },
];

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

    const payload = await req.json().catch(() => ({} as SeedConfig));
    const config: SeedConfig = payload || {};
    const users: SeedUser[] = Array.isArray(config.users) && config.users.length > 0 ? config.users : DEFAULT_USERS;
    const provisionalPassword = "Senha1234!"; // mínimo 8 caracteres

    const results: { createdUsers: number; ensuredRoles: number; insertedContratacoes: number } = {
      createdUsers: 0,
      ensuredRoles: 0,
      insertedContratacoes: 0,
    };

    const seededUserIds: Record<string, string> = {};

    // Cria/garante usuários e perfis/roles
    for (const u of users) {
      let userId: string | null = null;
      // Tenta criar com senha provisória
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: provisionalPassword,
        email_confirm: true,
        user_metadata: { nome_completo: u.nome_completo, must_change_password: true },
      });
      if (signUpError) {
        // Se já existe, tentamos localizar via profiles
        const { data: prof } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", u.email)
          .limit(1)
          .maybeSingle();
        userId = prof?.id ?? null;
      } else {
        userId = signUpData?.user?.id ?? null;
        if (userId) results.createdUsers++;
      }

      if (!userId) continue;
      seededUserIds[u.email] = userId;

      // Atualiza perfil
      await supabaseAdmin
        .from("profiles")
        .update({ nome_completo: u.nome_completo, setor: u.setor, cargo: u.cargo, email: u.email })
        .eq("id", userId);

      // Garante role desejada
      const { error: roleErr } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: u.role } as any, { onConflict: "user_id,role" } as any);
      if (!roleErr) results.ensuredRoles++;
    }

    // Decide quem será o created_by das contratações: primeiro setor_requisitante ou admin solicitante
    const createdBy =
      seededUserIds["requisitante.cti@example.com"] ||
      Object.values(seededUserIds)[0] ||
      requester.id;

    // Insere contratações somente se a tabela estiver vazia
    const { count: contrCount } = await supabaseAdmin
      .from("contratacoes")
      .select("id", { count: "exact" });

    if (!contrCount || contrCount === 0) {
      const contrRows = [
        {
          descricao: "Aquisição de notebooks",
          pdm_catser: "Informática",
          tipo_material_servico: "Material",
          justificativa: "Renovação do parque tecnológico",
          unidade_orcamentaria: "PGJ",
          setor_requisitante: "CTI",
          unidade_beneficiaria: "CTI",
          tipo_contratacao: "Nova Contratação",
          numero_contrato: null,
          modo_prestacao: "Continuado",
          quantidade_itens: 20,
          valor_unitario: 4500.0,
          valor_estimado: 90000.0,
          unidade_fornecimento: "Unidade",
          tipo_recurso: "Investimento",
          saldo_orcamentario: 120000.0,
          modalidade: "Pregão Eletrônico",
          normativo: "Lei 14.133/2021",
          grau_prioridade: "Alta",
          etapa_processo: "Planejamento",
          alinhamento_estrategico: true,
          houve_devolucao: false,
          quantidade_devolucoes: 0,
          created_by: createdBy,
        },
        {
          descricao: "Serviços de manutenção predial",
          pdm_catser: "Infraestrutura",
          tipo_material_servico: "Serviço",
          justificativa: "Preservação das instalações",
          unidade_orcamentaria: "FMMP",
          setor_requisitante: "CAA",
          unidade_beneficiaria: "CAA",
          tipo_contratacao: "Renovação",
          numero_contrato: "2023/45",
          modo_prestacao: "Recorrente",
          quantidade_itens: 1,
          valor_unitario: 150000.0,
          valor_estimado: 150000.0,
          unidade_fornecimento: "Serviço",
          tipo_recurso: "Custeio",
          modalidade: "Concorrência",
          normativo: "Lei 14.133/2021",
          grau_prioridade: "Média",
          etapa_processo: "Em Licitação",
          sobrestado: false,
          alinhamento_estrategico: false,
          houve_devolucao: true,
          quantidade_devolucoes: 1,
          motivo_devolucao: "Ajuste de escopo",
          created_by: createdBy,
        },
        {
          descricao: "Contratação de link de internet",
          pdm_catser: "Telecom",
          tipo_material_servico: "Serviço",
          justificativa: "Garantir conectividade das unidades",
          unidade_orcamentaria: "PGJ",
          setor_requisitante: "GSI",
          unidade_beneficiaria: "GSI",
          tipo_contratacao: "Nova Contratação",
          numero_contrato: null,
          modo_prestacao: "Recorrente",
          quantidade_itens: 6,
          valor_unitario: 1200.0,
          valor_estimado: 7200.0,
          unidade_fornecimento: "Mensalidade",
          tipo_recurso: "Custeio",
          modalidade: "Dispensa",
          normativo: "Lei 14.133/2021",
          grau_prioridade: "Alta",
          etapa_processo: "Planejamento",
          created_by: createdBy,
        },
        {
          descricao: "Aquisição de licenças de software",
          pdm_catser: "Software",
          tipo_material_servico: "Material",
          justificativa: "Atualização de ferramentas de trabalho",
          unidade_orcamentaria: "PGJ",
          setor_requisitante: "CTI",
          unidade_beneficiaria: "CTI",
          tipo_contratacao: "Aditivo Quantitativo",
          numero_contrato: "2023/12",
          modo_prestacao: "Único",
          quantidade_itens: 50,
          valor_unitario: 300.0,
          valor_estimado: 15000.0,
          unidade_fornecimento: "Licença",
          tipo_recurso: "Investimento",
          modalidade: "Pregão Eletrônico",
          normativo: "Lei 14.133/2021",
          grau_prioridade: "Média",
          etapa_processo: "Contratado",
          created_by: createdBy,
        },
        {
          descricao: "Aquisição de mobiliário",
          pdm_catser: "Patrimônio",
          tipo_material_servico: "Material",
          justificativa: "Ampliação de salas de treinamento",
          unidade_orcamentaria: "FEPDC",
          setor_requisitante: "CEAF",
          unidade_beneficiaria: "CEAF",
          tipo_contratacao: "Nova Contratação",
          numero_contrato: null,
          modo_prestacao: "Único",
          quantidade_itens: 30,
          valor_unitario: 800.0,
          valor_estimado: 24000.0,
          unidade_fornecimento: "Unidade",
          tipo_recurso: "Investimento",
          modalidade: "Pregão Eletrônico",
          normativo: "Lei 8.666/1993",
          grau_prioridade: "Baixa",
          etapa_processo: "Planejamento",
          created_by: createdBy,
        },
        {
          descricao: "Serviço de limpeza",
          pdm_catser: "Serviços Gerais",
          tipo_material_servico: "Serviço",
          justificativa: "Manutenção da higienização",
          unidade_orcamentaria: "FMMP",
          setor_requisitante: "CRH",
          unidade_beneficiaria: "CRH",
          tipo_contratacao: "Renovação",
          numero_contrato: "2022/99",
          modo_prestacao: "Recorrente",
          quantidade_itens: 1,
          valor_unitario: 200000.0,
          valor_estimado: 200000.0,
          unidade_fornecimento: "Serviço",
          tipo_recurso: "Custeio",
          modalidade: "Concorrência",
          normativo: "Lei 14.133/2021",
          grau_prioridade: "Alta",
          etapa_processo: "Concluído",
          created_by: createdBy,
        },
        {
          descricao: "Aquisição de material de expediente",
          pdm_catser: "Suprimentos",
          tipo_material_servico: "Material",
          justificativa: "Reposição de insumos",
          unidade_orcamentaria: "PGJ",
          setor_requisitante: "CLC",
          unidade_beneficiaria: "CLC",
          tipo_contratacao: "Nova Contratação",
          numero_contrato: null,
          modo_prestacao: "Único",
          quantidade_itens: 100,
          valor_unitario: 15.0,
          valor_estimado: 1500.0,
          unidade_fornecimento: "Unidade",
          tipo_recurso: "Custeio",
          modalidade: "Pregão Eletrônico",
          normativo: "Lei 14.133/2021",
          grau_prioridade: "Média",
          etapa_processo: "Planejamento",
          created_by: createdBy,
        },
        {
          descricao: "Serviço de capacitação",
          pdm_catser: "Capacitação",
          tipo_material_servico: "Serviço",
          justificativa: "Qualificação de servidores",
          unidade_orcamentaria: "PGJ",
          setor_requisitante: "CEAF",
          unidade_beneficiaria: "CEAF",
          tipo_contratacao: "Repactuação",
          numero_contrato: "2024/07",
          modo_prestacao: "Único",
          quantidade_itens: 1,
          valor_estimado: 50000.0,
          unidade_fornecimento: "Serviço",
          tipo_recurso: "Investimento",
          modalidade: "Inexigibilidade",
          normativo: "Lei 14.133/2021",
          grau_prioridade: "Baixa",
          etapa_processo: "Em Licitação",
          created_by: createdBy,
        },
      ];

      const { error: insertErr } = await supabaseAdmin
        .from("contratacoes")
        .insert(contrRows);

      if (!insertErr) {
        results.insertedContratacoes = contrRows.length;
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});