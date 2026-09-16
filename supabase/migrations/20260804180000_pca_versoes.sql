-- Tabela para registro das versões publicadas do PCA
CREATE TABLE IF NOT EXISTS public.pca_versoes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercicio       integer NOT NULL,
  versao          text NOT NULL,          -- ex: '4.0', '5.0'
  descricao       text,                   -- justificativa da nova versão
  publicado_por   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  publicado_em    timestamptz NOT NULL DEFAULT now(),
  total_demandas  integer,
  valor_total     numeric(15,2),
  ativo           boolean NOT NULL DEFAULT true,
  UNIQUE (exercicio, versao)
);

-- RLS
ALTER TABLE public.pca_versoes ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer usuário autenticado
CREATE POLICY "pca_versoes_select" ON public.pca_versoes
  FOR SELECT TO authenticated USING (true);

-- Inserção: somente administradores
CREATE POLICY "pca_versoes_insert" ON public.pca_versoes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'administrador'
    )
  );

-- Atualização: somente administradores
CREATE POLICY "pca_versoes_update" ON public.pca_versoes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'administrador'
    )
  );
