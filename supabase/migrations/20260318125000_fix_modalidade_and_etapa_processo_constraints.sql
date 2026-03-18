-- Fix modalidade and etapa_processo constraints on contratacoes table to match UI options
BEGIN;

-- 1. modalidade: include SRP options (ARP própria e ARP carona)
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_modalidade_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_modalidade_check 
  CHECK (modalidade IN (
    'Pregão Eletrônico', 
    'Dispensa', 
    'Inexigibilidade', 
    'Concorrência',
    'ARP (própria)',
    'ARP (carona)',
    'Inexibilidade' -- typo support for existing data if any
  ));

-- 2. etapa_processo: include all stage options used across different pages
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_etapa_processo_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_etapa_processo_check 
  CHECK (etapa_processo IN (
    'Planejamento', 
    'Iniciado', 
    'Retornado para Diligência', 
    'Em Licitação', 
    'Contratado', 
    'Concluído',
    'Planejada', -- SRP specific
    'Processo Administrativo Iniciado', -- SRP specific
    'Fase Externa da Licitação', -- SRP specific
    'Licitação Concluída', -- SRP specific
    'Ata Registrada', -- SRP specific
    'Cancelada'
  ));

COMMIT;
