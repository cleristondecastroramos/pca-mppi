-- Resumo financeiro e contagem por status para Setores Demandantes
CREATE OR REPLACE FUNCTION public.resumo_financeiro_contratacoes(
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
  total_demandas BIGINT,
  valor_estimado NUMERIC,
  valor_contratado NUMERIC,
  ajuste_orcamentario NUMERIC,
  saldo_orcamentario NUMERIC,
  count_planejamento BIGINT,
  count_em_andamento BIGINT,
  count_concluidos BIGINT,
  count_sobrestados BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH filtrado AS (
    SELECT *
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
  )
  SELECT
    COUNT(*)::BIGINT AS total_demandas,
    COALESCE(SUM(valor_estimado), 0) AS valor_estimado,
    COALESCE(SUM(valor_contratado), 0) AS valor_contratado,
    COALESCE(SUM(ajuste_orcamentario), 0) AS ajuste_orcamentario,
    COALESCE(SUM(saldo_orcamentario), 0) AS saldo_orcamentario,
    COALESCE(SUM(CASE WHEN etapa_processo = 'Planejamento' THEN 1 ELSE 0 END), 0)::BIGINT AS count_planejamento,
    COALESCE(SUM(CASE WHEN etapa_processo IN ('Em Licitação', 'Contratado') THEN 1 ELSE 0 END), 0)::BIGINT AS count_em_andamento,
    COALESCE(SUM(CASE WHEN etapa_processo = 'Concluído' THEN 1 ELSE 0 END), 0)::BIGINT AS count_concluidos,
    COALESCE(SUM(CASE WHEN sobrestado THEN 1 ELSE 0 END), 0)::BIGINT AS count_sobrestados
  FROM filtrado;
$$;