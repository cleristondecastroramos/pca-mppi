CREATE TABLE IF NOT EXISTS public.orcamento_planejado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setor_requisitante TEXT NOT NULL,
    ano INTEGER NOT NULL DEFAULT extract(year from now()),
    valor NUMERIC NOT NULL DEFAULT 0,
    trava_ativa BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(setor_requisitante, ano)
);

-- Ativar RLS
ALTER TABLE public.orcamento_planejado ENABLE ROW LEVEL SECURITY;

-- Permissões para Leitura (qualquer usuário logado pode ler, ou só administradores, mas os setores precisam da informação para ver seu limite)
CREATE POLICY "Leitura_orcamento_planejado" ON public.orcamento_planejado
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Permissões para Inserção/Atualização/Deleção: apenas administradores
-- (Você deve usar a abordagem de role checker da sua aplicação local no BD se não houver policy,
-- mas por padrão do Supabase, RLS p/ admins pode ser concedido diretamente via custom claims ou usando uma function)
-- Se não usar regras complexas no BD, no mínimo garanta que está liberado para o authenticated para o CRUD funcionar antes do app checar, 
-- ou use sua estrutura de perfis.
CREATE POLICY "Modificacao_orcamento_planejado" ON public.orcamento_planejado
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Caso tenha um `user_roles`, seria:
-- USING ( (select role from user_roles where user_id = auth.uid()) = 'administrador' );
