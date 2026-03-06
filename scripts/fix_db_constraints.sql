-- Comandos SQL para remover restrições de validação nas colunas 'tipo_contratacao' e 'classe' da tabela 'contratacoes'.
-- Execute no Editor SQL do seu dashboard Supabase.

-- 1. Remove a restrição da coluna 'tipo_contratacao', permitindo novos valores como 'Aditivo Quantitativo'
DO $$ 
BEGIN 
    ALTER TABLE contratacoes DROP CONSTRAINT IF EXISTS contratacoes_tipo_contratacao_check;
    EXCEPTION WHEN others THEN NULL;
END $$;

-- 2. Remove a restrição da coluna 'classe', permitindo novos valores como 'Material de Consumo'
DO $$ 
BEGIN 
    ALTER TABLE contratacoes DROP CONSTRAINT IF EXISTS contratacoes_classe_check;
    EXCEPTION WHEN others THEN NULL;
END $$;

-- Caso as restrições tenham outros nomes, este comando lista todas para você verificar:
-- SELECT conname FROM pg_constraint WHERE conrelid = 'contratacoes'::regclass;
