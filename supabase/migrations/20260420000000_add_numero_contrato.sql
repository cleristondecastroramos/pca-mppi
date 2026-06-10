-- Add numero_contrato column if it doesn't exist
ALTER TABLE contratacoes ADD COLUMN IF NOT EXISTS numero_contrato TEXT;
