-- Adiciona colunas para armazenar dados do catálogo (CATMAT/CATSER) no PCA 2027

ALTER TABLE public.contratacoes
  ADD COLUMN IF NOT EXISTS catmat_catser_tipo VARCHAR(50),
  ADD COLUMN IF NOT EXISTS catmat_catser_codigo VARCHAR(255),
  ADD COLUMN IF NOT EXISTS categoria_material_ou_servico VARCHAR(255);
