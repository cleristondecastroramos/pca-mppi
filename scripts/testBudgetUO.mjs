import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

function getEnv(name) {
  const v = process.env[name];
  if (!v || v.trim().length === 0) return null;
  return v;
}

const SUPABASE_URL = getEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function ensureAdminUser() {
  // Try to find any admin
  const { data: admins } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'administrador')
    .limit(1);
  const existingAdminId = admins?.[0]?.user_id || null;
  if (existingAdminId) return existingAdminId;

  // Create a new admin user
  const email = `uo-admin-test-${Date.now()}@example.com`;
  const password = 'Senha1234!';
  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome_completo: 'Admin Teste UO' },
  });
  if (signUpError) throw signUpError;
  const newUserId = signUpData?.user?.id;
  if (!newUserId) throw new Error('Falha ao criar usuário admin');

  await supabase.from('profiles').upsert({
    id: newUserId,
    nome_completo: 'Admin Teste UO',
    email,
    setor: 'PLANEJAMENTO',
    cargo: 'Administrador',
  });
  await supabase.from('user_roles').insert({ user_id: newUserId, role: 'administrador' });
  return newUserId;
}

async function upsertBudgets() {
  console.log('Upserting budgets for CTI: PGJ=100000, FMMP=50000');
  const rows = [
    { setor_requisitante: 'CTI', unidade_orcamentaria: 'PGJ', valor_aprovado: 100000 },
    { setor_requisitante: 'CTI', unidade_orcamentaria: 'FMMP', valor_aprovado: 50000 },
  ];
  const { error } = await supabase
    .from('orcamentos_uo')
    .upsert(rows, { onConflict: 'setor_requisitante,unidade_orcamentaria' });
  if (error) throw error;
}

function contrBase({ descricao, setor, uo, valorEstimado, etapa = 'Planejamento', valorContratado = null }) {
  return {
    descricao,
    justificativa: 'Teste de orçamento por UO',
    classe: 'Serviço',
    unidade_orcamentaria: uo,
    setor_requisitante: setor,
    tipo_contratacao: 'Nova Contratação',
    valor_estimado: valorEstimado,
    valor_contratado: valorContratado,
    tipo_recurso: 'Custeio',
    modalidade: 'Dispensa',
    grau_prioridade: 'Média',
    etapa_processo: etapa,
  };
}

async function cleanOldTests(prefix) {
  await supabase.from('contratacoes').delete().like('descricao', `${prefix}%`);
  await supabase.from('excedentes_autorizados').delete().eq('setor_requisitante', 'CTI');
}

async function insertContr(row) {
  const { data, error } = await supabase.from('contratacoes').insert(row).select('id').maybeSingle();
  if (error) throw error;
  return data?.id;
}

async function updateContr(id, patch) {
  const { error } = await supabase.from('contratacoes').update(patch).eq('id', id);
  if (error) throw error;
}

async function insertExcedente({ setor, uo, valor, justificativa, approved_by }) {
  const { error } = await supabase.from('excedentes_autorizados').insert({
    setor_requisitante: setor,
    unidade_orcamentaria: uo,
    valor_adicional: valor,
    justificativa,
    approved_by,
  });
  if (error) throw error;
}

async function run() {
  const prefix = `Test Budget UO ${Date.now()}`;
  console.log('Starting manual tests for UO budget control...');
  const adminId = await ensureAdminUser();
  await upsertBudgets();
  await cleanOldTests(prefix);

  const results = [];

  // Scenario A: Within budget
  try {
    const idA = await insertContr(contrBase({
      descricao: `${prefix} A1 - CTI PGJ 60k`,
      setor: 'CTI',
      uo: 'PGJ',
      valorEstimado: 60000,
    }));
    results.push({ scenario: 'A1', outcome: 'passed', id: idA });
  } catch (e) {
    results.push({ scenario: 'A1', outcome: 'failed', error: e.message });
  }

  // Scenario B: Exceed budget with new demand
  try {
    await insertContr(contrBase({
      descricao: `${prefix} B1 - CTI PGJ 50k`,
      setor: 'CTI',
      uo: 'PGJ',
      valorEstimado: 50000,
    }));
    results.push({ scenario: 'B1', outcome: 'unexpectedly passed' });
  } catch (e) {
    results.push({ scenario: 'B1', outcome: 'blocked as expected', error: e.message });
  }

  // Find the A1 record to update
  const { data: a1 } = await supabase
    .from('contratacoes')
    .select('id')
    .like('descricao', `${prefix} A1%`)
    .limit(1)
    .maybeSingle();

  // Scenario C: Contract and then cancel to free reservations, then insert B1 again
  if (a1?.id) {
    try {
      await updateContr(a1.id, { etapa_processo: 'Contratado', valor_contratado: 60000 });
      await updateContr(a1.id, { etapa_processo: 'Cancelada' });
      results.push({ scenario: 'C1', outcome: 'passed' });
    } catch (e) {
      results.push({ scenario: 'C1', outcome: 'failed', error: e.message });
    }
  }

  try {
    const idB2 = await insertContr(contrBase({
      descricao: `${prefix} C2 - CTI PGJ 50k após cancelamento`,
      setor: 'CTI',
      uo: 'PGJ',
      valorEstimado: 50000,
    }));
    results.push({ scenario: 'C2', outcome: 'passed', id: idB2 });
  } catch (e) {
    results.push({ scenario: 'C2', outcome: 'failed', error: e.message });
  }

  // Scenario D: Insert record that should be blocked, then add excedente and retry
  try {
    await insertContr(contrBase({
      descricao: `${prefix} D1 - CTI PGJ 70k`,
      setor: 'CTI',
      uo: 'PGJ',
      valorEstimado: 70000,
    }));
    results.push({ scenario: 'D1', outcome: 'unexpectedly passed' });
  } catch (e) {
    results.push({ scenario: 'D1', outcome: 'blocked as expected', error: e.message });
  }

  try {
    await insertExcedente({
      setor: 'CTI',
      uo: 'PGJ',
      valor: 30000,
      justificativa: 'Excedente de teste PGJ',
      approved_by: adminId,
    });
    results.push({ scenario: 'D2', outcome: 'excedente inserted' });
  } catch (e) {
    results.push({ scenario: 'D2', outcome: 'failed', error: e.message });
  }

  try {
    const idD3 = await insertContr(contrBase({
      descricao: `${prefix} D3 - CTI PGJ 70k após excedente`,
      setor: 'CTI',
      uo: 'PGJ',
      valorEstimado: 70000,
    }));
    results.push({ scenario: 'D3', outcome: 'passed', id: idD3 });
  } catch (e) {
    results.push({ scenario: 'D3', outcome: 'failed', error: e.message });
  }

  // Scenario E: Sector overview per UO
  try {
    const { data: overview, error: ovErr } = await supabase.rpc('orcamento_setorial', { p_setor: 'CTI' });
    if (ovErr) throw ovErr;
    results.push({ scenario: 'E1', outcome: 'overview', data: overview });
  } catch (e) {
    results.push({ scenario: 'E1', outcome: 'failed', error: e.message });
  }

  // Scenario F: FMMP budget exceed then add excedente
  try {
    await insertContr(contrBase({
      descricao: `${prefix} F1 - CTI FMMP 60k`,
      setor: 'CTI',
      uo: 'FMMP',
      valorEstimado: 60000,
    }));
    results.push({ scenario: 'F1', outcome: 'unexpectedly passed' });
  } catch (e) {
    results.push({ scenario: 'F1', outcome: 'blocked as expected', error: e.message });
  }

  try {
    await insertExcedente({
      setor: 'CTI',
      uo: 'FMMP',
      valor: 20000,
      justificativa: 'Excedente de teste FMMP',
      approved_by: adminId,
    });
    results.push({ scenario: 'F2', outcome: 'excedente inserted' });
  } catch (e) {
    results.push({ scenario: 'F2', outcome: 'failed', error: e.message });
  }

  try {
    const idF3 = await insertContr(contrBase({
      descricao: `${prefix} F3 - CTI FMMP 60k após excedente`,
      setor: 'CTI',
      uo: 'FMMP',
      valorEstimado: 60000,
    }));
    results.push({ scenario: 'F3', outcome: 'passed', id: idF3 });
  } catch (e) {
    results.push({ scenario: 'F3', outcome: 'failed', error: e.message });
  }

  console.log('Results:', JSON.stringify(results, null, 2));
}

run().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});