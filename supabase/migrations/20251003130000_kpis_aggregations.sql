-- Funções RPC para agregações e opções distintas em contratações
-- KPIs por modalidade
CREATE OR REPLACE FUNCTION public.kpi_contratacoes_por_modalidade(
  p_unidade_orcamentaria TEXT DEFAULT NULL,
  p_setor_requisitante TEXT DEFAULT NULL,
  p_tipo_contratacao TEXT DEFAULT NULL,
  p_tipo_recurso TEXT DEFAULT NULL,
  p_classe TEXT DEFAULT NULL,
  p_grau_prioridade TEXT DEFAULT NULL,
  p_normativo TEXT DEFAULT NULL,
  p_etapa_processo TEXT DEFAULT NULL
)
RETURNS TABLE (
  modalidade TEXT,
  total_demandas BIGINT,
  total_estimado NUMERIC,
  total_contratado NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.modalidade,
    COUNT(*)::BIGINT AS total_demandas,
    COALESCE(SUM(c.valor_estimado), 0) AS total_estimado,
    COALESCE(SUM(c.valor_contratado), 0) AS total_contratado
  FROM public.contratacoes c
  WHERE
    (p_unidade_orcamentaria IS NULL OR c.unidade_orcamentaria = p_unidade_orcamentaria) AND
    (p_setor_requisitante IS NULL OR c.setor_requisitante = p_setor_requisitante) AND
    (p_tipo_contratacao IS NULL OR c.tipo_contratacao = p_tipo_contratacao) AND
    (p_tipo_recurso IS NULL OR c.tipo_recurso = p_tipo_recurso) AND
    (p_classe IS NULL OR c.classe = p_classe) AND
    (p_grau_prioridade IS NULL OR c.grau_prioridade = p_grau_prioridade) AND
    (p_normativo IS NULL OR c.normativo = p_normativo) AND
    (p_etapa_processo IS NULL OR c.etapa_processo = p_etapa_processo)
  GROUP BY c.modalidade
  ORDER BY c.modalidade;
$$;

-- KPIs por status (etapa_processo)
CREATE OR REPLACE FUNCTION public.kpi_contratacoes_por_status(
  p_unidade_orcamentaria TEXT DEFAULT NULL,
  p_setor_requisitante TEXT DEFAULT NULL,
  p_tipo_contratacao TEXT DEFAULT NULL,
  p_tipo_recurso TEXT DEFAULT NULL,
  p_classe TEXT DEFAULT NULL,
  p_grau_prioridade TEXT DEFAULT NULL,
  p_normativo TEXT DEFAULT NULL,
  p_etapa_processo TEXT DEFAULT NULL
)
RETURNS TABLE (
  etapa_processo TEXT,
  total_demandas BIGINT,
  total_estimado NUMERIC,
  total_contratado NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.etapa_processo,
    COUNT(*)::BIGINT AS total_demandas,
    COALESCE(SUM(c.valor_estimado), 0) AS total_estimado,
    COALESCE(SUM(c.valor_contratado), 0) AS total_contratado
  FROM public.contratacoes c
  WHERE
    (p_unidade_orcamentaria IS NULL OR c.unidade_orcamentaria = p_unidade_orcamentaria) AND
    (p_setor_requisitante IS NULL OR c.setor_requisitante = p_setor_requisitante) AND
    (p_tipo_contratacao IS NULL OR c.tipo_contratacao = p_tipo_contratacao) AND
    (p_tipo_recurso IS NULL OR c.tipo_recurso = p_tipo_recurso) AND
    (p_classe IS NULL OR c.classe = p_classe) AND
    (p_grau_prioridade IS NULL OR c.grau_prioridade = p_grau_prioridade) AND
    (p_normativo IS NULL OR c.normativo = p_normativo) AND
    (p_etapa_processo IS NULL OR c.etapa_processo = p_etapa_processo)
  GROUP BY c.etapa_processo
  ORDER BY c.etapa_processo;
$$;

-- Opções distintas para filtros
CREATE OR REPLACE FUNCTION public.contratacoes_distinct()
RETURNS TABLE (
  unidade_orcamentaria TEXT[],
  setor_requisitante TEXT[],
  tipo_contratacao TEXT[],
  tipo_recurso TEXT[],
  classe TEXT[],
  grau_prioridade TEXT[],
  normativo TEXT[],
  modalidade TEXT[],
  etapa_processo TEXT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ARRAY(SELECT DISTINCT unidade_orcamentaria FROM public.contratacoes WHERE unidade_orcamentaria IS NOT NULL ORDER BY 1),
    ARRAY(SELECT DISTINCT setor_requisitante FROM public.contratacoes WHERE setor_requisitante IS NOT NULL ORDER BY 1),
    ARRAY(SELECT DISTINCT tipo_contratacao FROM public.contratacoes WHERE tipo_contratacao IS NOT NULL ORDER BY 1),
    ARRAY(SELECT DISTINCT tipo_recurso FROM public.contratacoes WHERE tipo_recurso IS NOT NULL ORDER BY 1),
    ARRAY(SELECT DISTINCT classe FROM public.contratacoes WHERE classe IS NOT NULL ORDER BY 1),
    ARRAY(SELECT DISTINCT grau_prioridade FROM public.contratacoes WHERE grau_prioridade IS NOT NULL ORDER BY 1),
    ARRAY(SELECT DISTINCT normativo FROM public.contratacoes WHERE normativo IS NOT NULL ORDER BY 1),
    ARRAY(SELECT DISTINCT modalidade FROM public.contratacoes WHERE modalidade IS NOT NULL ORDER BY 1),
    ARRAY(SELECT DISTINCT etapa_processo FROM public.contratacoes WHERE etapa_processo IS NOT NULL ORDER BY 1);
$$;