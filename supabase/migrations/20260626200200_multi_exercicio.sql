-- 1. Alterações na tabela contratacoes
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS exercicio INTEGER DEFAULT 2026;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS codigo_pca VARCHAR(255);
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS unidade_demandante VARCHAR(255);
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS grau_prioridade VARCHAR(50);
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC(15,2);
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS mes_estimado INTEGER;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS situacao VARCHAR(255);
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS justificativa_alteracao TEXT;
ALTER TABLE public.contratacoes ADD COLUMN IF NOT EXISTS data_ultima_alteracao TIMESTAMP WITH TIME ZONE;

-- 2. Tabela etapas_pca
CREATE TABLE IF NOT EXISTS public.etapas_pca (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exercicio INTEGER NOT NULL,
    nome VARCHAR(255) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    obrigatorio BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela etapas_status
CREATE TABLE IF NOT EXISTS public.etapas_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contratacao_id UUID NOT NULL REFERENCES public.contratacoes(id) ON DELETE CASCADE,
    etapa_id UUID NOT NULL REFERENCES public.etapas_pca(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    data_conclusao TIMESTAMP WITH TIME ZONE,
    observacao TEXT,
    responsavel_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(contratacao_id, etapa_id)
);

-- Habilitar RLS
ALTER TABLE public.etapas_pca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas_status ENABLE ROW LEVEL SECURITY;

-- Políticas provisórias para as novas tabelas (leitura pública, escrita autenticada)
CREATE POLICY "Leitura pública para etapas_pca" ON public.etapas_pca FOR SELECT USING (true);
CREATE POLICY "Leitura pública para etapas_status" ON public.etapas_status FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir etapas_status" ON public.etapas_status FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar etapas_status" ON public.etapas_status FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar etapas_status" ON public.etapas_status FOR DELETE TO authenticated USING (true);
