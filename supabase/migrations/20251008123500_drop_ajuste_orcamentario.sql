-- Migration: Drop coluna ajuste_orcamentario da tabela public.contratacoes
-- Objetivo: Remover a coluna obsoleta de todo o sistema

BEGIN;

-- Remove a coluna caso exista
ALTER TABLE public.contratacoes
  DROP COLUMN IF EXISTS ajuste_orcamentario;

COMMIT;