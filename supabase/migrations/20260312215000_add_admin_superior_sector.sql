-- Adição do novo setor 'Administração Superior' às restrições do banco
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_setor_requisitante_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_setor_requisitante_check 
  CHECK (setor_requisitante IN (
    'Administração Superior', 'CAA', 'CCF', 'CCS', 'CLC', 'CPPT', 'CTI', 'CRH', 'CEAF', 'GAECO', 'GSI', 'CONINT', 'PLANEJAMENTO', 'PROCON'
  ));
