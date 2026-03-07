CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(50) NOT NULL,
    mensagem VARCHAR(150) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'info',
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    autor_id UUID REFERENCES public.profiles(id),
    ativa BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.notificacoes_lidas (
    notificacao_id UUID REFERENCES public.notificacoes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    data_leitura TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (notificacao_id, usuario_id)
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_lidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notificacoes leitura" ON public.notificacoes
    FOR SELECT USING (auth.role() = 'authenticated' AND ativa = true);

-- Políticas para permitir inserção e modificação por todos (protegido no frontend para admins)
CREATE POLICY "Notificacoes admin" ON public.notificacoes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Notificacoes lidas select" ON public.notificacoes_lidas
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Notificacoes lidas insert" ON public.notificacoes_lidas
    FOR INSERT WITH CHECK (usuario_id = auth.uid());
