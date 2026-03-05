
-- Executar este SQL no Supabase para criar a coluna de código curto

ALTER TABLE contratacoes ADD COLUMN IF NOT EXISTS codigo TEXT UNIQUE;

-- Opcional: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_contratacoes_codigo ON contratacoes(codigo);
