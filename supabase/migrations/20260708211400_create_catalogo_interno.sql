-- Migration to create the internal catalog for PCA 2027 and link it to contratacoes

CREATE TABLE IF NOT EXISTS public.catalogo_interno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('material', 'servico')),
    codigo TEXT,
    grupo TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    exercicio INTEGER,
    ordem_exibicao INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.catalogo_interno ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone authenticated can view active items
CREATE POLICY "Permitir leitura do catálogo para usuários autenticados" 
    ON public.catalogo_interno 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Insert/Update/Delete policies: Only administrators
CREATE POLICY "Permitir inserção para administradores" 
    ON public.catalogo_interno 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Permitir atualização para administradores" 
    ON public.catalogo_interno 
    FOR UPDATE 
    TO authenticated 
    USING (public.has_role(auth.uid(), 'administrador'))
    WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Permitir exclusão para administradores" 
    ON public.catalogo_interno 
    FOR DELETE 
    TO authenticated 
    USING (public.has_role(auth.uid(), 'administrador'));

-- Custom function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at_catalogo_interno
    BEFORE UPDATE ON public.catalogo_interno
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Update contratacoes table
ALTER TABLE public.contratacoes 
ADD COLUMN IF NOT EXISTS catalogo_interno_id UUID REFERENCES public.catalogo_interno(id);

-- Create index for faster joins
CREATE INDEX IF NOT EXISTS idx_contratacoes_catalogo_interno_id ON public.contratacoes(catalogo_interno_id);
