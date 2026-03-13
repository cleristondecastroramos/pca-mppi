ALTER TABLE public.contratacoes
ADD COLUMN srp BOOLEAN DEFAULT FALSE;

ALTER TABLE public.contratacoes_conformidade
ADD COLUMN assinatura_contrato BOOLEAN DEFAULT FALSE,
ADD COLUMN publicacao_contrato BOOLEAN DEFAULT FALSE;

-- Atualização v1.0.52: Aumento do limite de caracteres das notificações para 200
ALTER TABLE public.notificacoes ALTER COLUMN mensagem TYPE varchar(200);

-- Atualização v1.0.52: Novo setor 'Administração Superior'
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_setor_requisitante_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_setor_requisitante_check 
  CHECK (setor_requisitante IN (
    'Administração Superior', 'CAA', 'CCF', 'CCS', 'CLC', 'CPPT', 'CTI', 'CRH', 'CEAF', 'GAECO', 'GSI', 'CONINT', 'PLANEJAMENTO', 'PROCON'
  ));
