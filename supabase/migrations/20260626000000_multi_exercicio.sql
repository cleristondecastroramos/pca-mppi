-- Migração para suporte ao modelo multi-exercício e PCA 2027

ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS exercicio INTEGER DEFAULT 2026;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS codigo_pca TEXT;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS unidade_demandante TEXT;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS catmat_catser_codigo TEXT;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS catmat_catser_tipo TEXT CHECK (catmat_catser_tipo IN ('CATMAT', 'CATSER'));
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS categoria_material_ou_servico TEXT;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS quantidade INTEGER;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS valor_total DECIMAL(15, 2);
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS prioridade TEXT;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS status_planejamento TEXT DEFAULT 'Pendente';
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS status_aprovacao TEXT DEFAULT 'Pendente de análise' CHECK (status_aprovacao IN ('Pendente de análise', 'Aprovada integralmente', 'Aprovada parcialmente', 'Não aprovada'));
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS justificativa_nao_aprovacao TEXT;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Atualizar registros existentes para garantir retrocompatibilidade completa
UPDATE public.contratacoes SET exercicio = 2026 WHERE exercicio IS NULL;
