
-- Executar este SQL no Supabase para criar a coluna PDM/CATSER

ALTER TABLE contratacoes ADD COLUMN IF NOT EXISTS pdm_catser TEXT;
