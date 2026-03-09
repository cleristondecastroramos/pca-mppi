-- Fix constraints on contratacoes table to match UI options
BEGIN;

-- 1. normativo: allow values from UI
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_normativo_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_normativo_check 
  CHECK (normativo IN ('Lei 8.666/1993', 'Lei 14.133/2021', '8.666/1993', '14.133/2021'));

-- 2. classe: include all UI options and rename 'Engenharia' to 'Serviço de Engenharia' for consistency or just allow both
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_classe_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_classe_check 
  CHECK (classe IN (
    'Material de Consumo', 
    'Material Permanente', 
    'Serviço', 
    'Serviço de TI', 
    'Engenharia', 
    'Serviço de Engenharia', 
    'Serviço de Terceirizado', 
    'Obra', 
    'Software', 
    'Treinamento'
  ));

-- 3. setor_requisitante: include PROCON
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_setor_requisitante_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_setor_requisitante_check 
  CHECK (setor_requisitante IN (
    'CAA', 'CCF', 'CCS', 'CLC', 'CPPT', 'CTI', 'CRH', 'CEAF', 'GAECO', 'GSI', 'CONINT', 'PLANEJAMENTO', 'PROCON'
  ));

-- 4. tipo_contratacao: include new options
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_tipo_contratacao_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_tipo_contratacao_check 
  CHECK (tipo_contratacao IN (
    'Nova Contratação', 'Renovação', 'Aditivo Quantitativo', 'Repactuação', 'Apostilamento', 'Indeterminado'
  ));

COMMIT;
