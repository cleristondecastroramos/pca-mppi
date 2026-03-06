
-- Remover a restrição de verificação (CHECK constraint) da coluna 'classe' na tabela 'contratacoes'
-- Isso permite que novos valores como 'Serviço de Terceirizado', 'Software' e 'Treinamento' sejam aceitos.

ALTER TABLE contratacoes DROP CONSTRAINT IF EXISTS contratacoes_classe_check;

-- Garantir que a coluna seja do tipo TEXT para aceitar qualquer valor
ALTER TABLE contratacoes ALTER COLUMN classe TYPE text;
