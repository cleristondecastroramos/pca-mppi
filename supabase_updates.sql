ALTER TABLE public.contratacoes
ADD COLUMN srp BOOLEAN DEFAULT FALSE;

ALTER TABLE public.contratacoes_conformidade
ADD COLUMN assinatura_contrato BOOLEAN DEFAULT FALSE,
ADD COLUMN publicacao_contrato BOOLEAN DEFAULT FALSE;

-- AtualizaÃ§Ã£o v1.0.52: Aumento do limite de caracteres das notificaÃ§Ãµes para 200
ALTER TABLE public.notificacoes ALTER COLUMN mensagem TYPE varchar(200);

-- AtualizaÃ§Ã£o v1.0.52: Novo setor 'AdministraÃ§Ã£o Superior'
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_setor_requisitante_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_setor_requisitante_check 
  CHECK (setor_requisitante IN (
    'AdministraÃ§Ã£o Superior', 'CAA', 'CCF', 'CCS', 'CLC', 'CPPT', 'CTI', 'CRH', 'CEAF', 'GAECO', 'GSI', 'CONINT', 'PLANEJAMENTO', 'PROCON'
  ));

-- Atualização v1.0.54: Adicionar campo para justificar aprovação parcial ou não aprovação
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS motivo_analise TEXT;

-- Atualização v1.0.55: Adicionar campo must_change_password para forçar alteração de senha provisória
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
