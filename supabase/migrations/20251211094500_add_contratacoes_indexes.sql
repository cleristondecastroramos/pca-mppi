-- Indexes to improve query performance for contratacoes filtering and ordering
CREATE INDEX IF NOT EXISTS idx_contratacoes_created_at ON public.contratacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contratacoes_unidade_orcamentaria ON public.contratacoes(unidade_orcamentaria);
CREATE INDEX IF NOT EXISTS idx_contratacoes_setor_requisitante ON public.contratacoes(setor_requisitante);
CREATE INDEX IF NOT EXISTS idx_contratacoes_tipo_contratacao ON public.contratacoes(tipo_contratacao);
CREATE INDEX IF NOT EXISTS idx_contratacoes_tipo_recurso ON public.contratacoes(tipo_recurso);
CREATE INDEX IF NOT EXISTS idx_contratacoes_classe ON public.contratacoes(classe);
CREATE INDEX IF NOT EXISTS idx_contratacoes_grau_prioridade ON public.contratacoes(grau_prioridade);
CREATE INDEX IF NOT EXISTS idx_contratacoes_normativo ON public.contratacoes(normativo);
CREATE INDEX IF NOT EXISTS idx_contratacoes_modalidade ON public.contratacoes(modalidade);
CREATE INDEX IF NOT EXISTS idx_contratacoes_etapa_processo ON public.contratacoes(etapa_processo);
CREATE INDEX IF NOT EXISTS idx_contratacoes_sobrestado ON public.contratacoes(sobrestado);
