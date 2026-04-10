-- Migração: Suporte a sobrestamento total e parcial
-- Adiciona campos para controle de sobrestamento e atualiza regras orçamentárias e de KPI.

BEGIN;

-- 1. Adicionar campos na tabela de contratações
ALTER TABLE public.contratacoes
  ADD COLUMN IF NOT EXISTS tipo_sobrestamento TEXT CHECK (tipo_sobrestamento IN ('total', 'parcial')),
  ADD COLUMN IF NOT EXISTS quantidade_sobrestada NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_sobrestado NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quantidade_ativa NUMERIC,
  ADD COLUMN IF NOT EXISTS valor_ativo NUMERIC;

-- 2. Backfill para demandas existentes
UPDATE public.contratacoes
SET 
  tipo_sobrestamento = CASE WHEN sobrestado = true THEN 'total' ELSE NULL END,
  quantidade_ativa = COALESCE(quantidade_itens, 0),
  valor_ativo = COALESCE(valor_estimado, 0)
WHERE tipo_sobrestamento IS NULL;

-- 3. Atualizar função de bloqueio orçamentário (check_orcamento_limite)
CREATE OR REPLACE FUNCTION public.check_orcamento_limite()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_orcamento_aprovado NUMERIC := 0;
  v_excedentes NUMERIC := 0;
  v_reservado_total NUMERIC := 0;
  v_reservado_ajustado NUMERIC := 0;
  old_reserved NUMERIC := 0;
  new_reserved NUMERIC := 0;
  is_admin BOOLEAN := public.has_role(auth.uid(), 'administrador'::public.perfil_acesso);
BEGIN
  -- orçamento aprovado da UO
  SELECT COALESCE(valor_aprovado, 0) INTO v_orcamento_aprovado
  FROM public.orcamentos_uo
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  -- excedentes autorizados da UO
  SELECT COALESCE(SUM(valor_adicional), 0) INTO v_excedentes
  FROM public.excedentes_autorizados
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  -- reservado total atual da UO (somatório considerando etapa e sobrestamento)
  SELECT COALESCE(SUM(
    CASE
      WHEN tipo_sobrestamento = 'total' THEN 0
      WHEN tipo_sobrestamento = 'parcial' THEN COALESCE(valor_ativo, 0)
      WHEN etapa_processo IN ('Contratado','Concluído') THEN COALESCE(valor_contratado,0)
      WHEN etapa_processo = 'Cancelada' THEN 0
      ELSE COALESCE(valor_estimado,0)
    END
  ), 0)
  INTO v_reservado_total
  FROM public.contratacoes
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  -- reservado antigo (apenas em UPDATE)
  IF TG_OP = 'UPDATE' THEN
    IF OLD.tipo_sobrestamento = 'total' THEN
      old_reserved := 0;
    ELSIF OLD.tipo_sobrestamento = 'parcial' THEN
      old_reserved := COALESCE(OLD.valor_ativo, 0);
    ELSIF OLD.etapa_processo IN ('Contratado','Concluído') THEN
      old_reserved := COALESCE(OLD.valor_contratado,0);
    ELSIF OLD.etapa_processo = 'Cancelada' THEN
      old_reserved := 0;
    ELSE
      old_reserved := COALESCE(OLD.valor_estimado,0);
    END IF;
  END IF;

  -- reservado novo
  IF NEW.tipo_sobrestamento = 'total' THEN
    new_reserved := 0;
  ELSIF NEW.tipo_sobrestamento = 'parcial' THEN
    new_reserved := COALESCE(NEW.valor_ativo, 0);
  ELSIF NEW.etapa_processo IN ('Contratado','Concluído') THEN
    new_reserved := COALESCE(NEW.valor_contratado,0);
  ELSIF NEW.etapa_processo = 'Cancelada' THEN
    new_reserved := 0;
  ELSE
    new_reserved := COALESCE(NEW.valor_estimado,0);
  END IF;

  -- ajustar reservado com a alteração atual
  IF TG_OP = 'UPDATE' THEN
    v_reservado_ajustado := v_reservado_total - old_reserved + new_reserved;
  ELSE
    v_reservado_ajustado := v_reservado_total + new_reserved;
  END IF;

  IF NOT is_admin AND v_reservado_ajustado > (v_orcamento_aprovado + v_excedentes) THEN
    RAISE EXCEPTION 'Saldo orçamentário insuficiente na UO selecionada. Solicite autorização do administrador para excedente.';
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Atualizar função de recalculo financeiro (recalcula_contratacao_financeiro)
CREATE OR REPLACE FUNCTION public.recalcula_contratacao_financeiro()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_orcamento_aprovado NUMERIC := 0;
  v_excedentes NUMERIC := 0;
  v_reservado_total NUMERIC := 0;
  v_saldo NUMERIC := 0;
BEGIN
  -- orçamento aprovado da UO
  SELECT COALESCE(valor_aprovado, 0) INTO v_orcamento_aprovado
  FROM public.orcamentos_uo
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  -- excedentes autorizados da UO
  SELECT COALESCE(SUM(valor_adicional), 0) INTO v_excedentes
  FROM public.excedentes_autorizados
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  -- reservado total atual da UO
  SELECT COALESCE(SUM(
    CASE
      WHEN tipo_sobrestamento = 'total' THEN 0
      WHEN tipo_sobrestamento = 'parcial' THEN COALESCE(valor_ativo, 0)
      WHEN etapa_processo IN ('Contratado','Concluído') THEN COALESCE(valor_contratado,0)
      WHEN etapa_processo = 'Cancelada' THEN 0
      ELSE COALESCE(valor_estimado,0)
    END
  ), 0)
  INTO v_reservado_total
  FROM public.contratacoes
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  v_saldo := (v_orcamento_aprovado + v_excedentes) - v_reservado_total;
  
  -- Saldo orçamentário por demanda
  IF NEW.etapa_processo = 'Cancelada' OR NEW.tipo_sobrestamento = 'total' THEN
    NEW.saldo_orcamentario := 0;
  ELSIF NEW.tipo_sobrestamento = 'parcial' THEN
    NEW.saldo_orcamentario := COALESCE(NEW.valor_ativo, 0) - COALESCE(NEW.valor_contratado, 0);
  ELSE
    NEW.saldo_orcamentario := COALESCE(NEW.valor_estimado, 0) - COALESCE(NEW.valor_contratado, 0);
  END IF;

  NEW.status_financeiro := CASE WHEN v_saldo >= 0 THEN 'OK' ELSE 'INSUFICIENTE' END;
  NEW.data_atualizacao_saldo := NOW();
  NEW.usuario_atualizacao := auth.uid();
  RETURN NEW;
END;
$$;

-- 5. Atualizar função orcamento_setorial
CREATE OR REPLACE FUNCTION public.orcamento_setorial(p_setor TEXT)
RETURNS TABLE (
  unidade_orcamentaria TEXT,
  total_aprovado NUMERIC,
  reservado_total NUMERIC,
  total_executado NUMERIC,
  excedentes_autorizados NUMERIC,
  saldo_disponivel NUMERIC,
  percent_execucao NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH uo AS (
    SELECT
      ou.unidade_orcamentaria,
      COALESCE(ou.valor_aprovado,0) AS aprovado,
      COALESCE((
        SELECT SUM(CASE
          WHEN c.tipo_sobrestamento = 'total' THEN 0
          WHEN c.tipo_sobrestamento = 'parcial' THEN COALESCE(c.valor_ativo, 0)
          WHEN c.etapa_processo IN ('Contratado','Concluído') THEN COALESCE(c.valor_contratado,0)
          WHEN c.etapa_processo = 'Cancelada' THEN 0
          ELSE COALESCE(c.valor_estimado,0)
        END)
        FROM public.contratacoes c
        WHERE c.setor_requisitante = ou.setor_requisitante
          AND c.unidade_orcamentaria = ou.unidade_orcamentaria
      ),0) AS reservado,
      COALESCE((
        SELECT SUM(c.valor_contratado)
        FROM public.contratacoes c
        WHERE c.setor_requisitante = ou.setor_requisitante
          AND c.unidade_orcamentaria = ou.unidade_orcamentaria
          AND (c.tipo_sobrestamento IS NULL OR c.tipo_sobrestamento <> 'total')
      ),0) AS executado,
      COALESCE((
        SELECT SUM(e.valor_adicional)
        FROM public.excedentes_autorizados e
        WHERE e.setor_requisitante = ou.setor_requisitante
          AND e.unidade_orcamentaria = ou.unidade_orcamentaria
      ),0) AS excedentes
    FROM public.orcamentos_uo ou
    WHERE ou.setor_requisitante = p_setor
  )
  SELECT
    unidade_orcamentaria,
    aprovado AS total_aprovado,
    reservado AS reservado_total,
    executado AS total_executado,
    excedentes AS excedentes_autorizados,
    (aprovado + excedentes - reservado) AS saldo_disponivel,
    CASE WHEN (aprovado + excedentes) = 0 THEN 0
         ELSE ROUND((executado / NULLIF(aprovado + excedentes,0)) * 100, 2)
    END AS percent_execucao
  FROM uo
  ORDER BY unidade_orcamentaria;
$$;

-- 6. Atualizar função saldo_uo_por_demanda
CREATE OR REPLACE FUNCTION public.saldo_uo_por_demanda(p_setor TEXT)
RETURNS TABLE (
  unidade_orcamentaria TEXT,
  saldo_total NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH saldos AS (
    SELECT
      c.unidade_orcamentaria,
      COALESCE(
        SUM(
          CASE 
            WHEN c.tipo_sobrestamento = 'total' OR c.etapa_processo = 'Cancelada' THEN COALESCE(c.valor_estimado,0) 
            WHEN c.tipo_sobrestamento = 'parcial' THEN (COALESCE(c.valor_estimado,0) - COALESCE(c.valor_ativo, 0)) + (COALESCE(c.valor_ativo, 0) - COALESCE(c.valor_contratado, 0))
            ELSE COALESCE(c.valor_estimado,0) - COALESCE(c.valor_contratado,0)
          END
        ), 0
      ) AS saldo_demandas
    FROM public.contratacoes c
    WHERE c.setor_requisitante = p_setor
    GROUP BY c.unidade_orcamentaria
  )
  SELECT 
    s.unidade_orcamentaria,
    s.saldo_demandas AS saldo_total
  FROM saldos s
  ORDER BY s.unidade_orcamentaria;
$$;

COMMIT;
