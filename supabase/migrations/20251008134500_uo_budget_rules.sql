-- Migração: Controle orçamentário por UO (setor + unidade_orcamentaria)
-- Cria tabela de orçamentos por UO, ajusta excedentes para UO e
-- atualiza função de bloqueio para respeitar reservas e saldo por UO.

BEGIN;

-- Tabela de orçamento por UO dentro do setor
CREATE TABLE IF NOT EXISTS public.orcamentos_uo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setor_requisitante TEXT NOT NULL,
  unidade_orcamentaria TEXT NOT NULL CHECK (unidade_orcamentaria IN ('PGJ','FMMP','FEPDC')),
  valor_aprovado NUMERIC NOT NULL CHECK (valor_aprovado >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (setor_requisitante, unidade_orcamentaria)
);

ALTER TABLE public.orcamentos_uo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orcamentos UO: todos autenticados podem ver" ON public.orcamentos_uo;
CREATE POLICY "Orcamentos UO: todos autenticados podem ver"
  ON public.orcamentos_uo FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Orcamentos UO: somente administradores podem inserir" ON public.orcamentos_uo;
CREATE POLICY "Orcamentos UO: somente administradores podem inserir"
  ON public.orcamentos_uo FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'administrador'::public.perfil_acesso));

DROP POLICY IF EXISTS "Orcamentos UO: somente administradores podem atualizar" ON public.orcamentos_uo;
CREATE POLICY "Orcamentos UO: somente administradores podem atualizar"
  ON public.orcamentos_uo FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'::public.perfil_acesso));

DROP POLICY IF EXISTS "Orcamentos UO: somente administradores podem deletar" ON public.orcamentos_uo;
CREATE POLICY "Orcamentos UO: somente administradores podem deletar"
  ON public.orcamentos_uo FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'::public.perfil_acesso));

-- Excedentes: acrescentar coluna para UO
ALTER TABLE public.excedentes_autorizados
  ADD COLUMN IF NOT EXISTS unidade_orcamentaria TEXT CHECK (unidade_orcamentaria IN ('PGJ','FMMP','FEPDC'));

-- Campos de auditoria e rastreio de saldo nas contratações
ALTER TABLE public.contratacoes
  ADD COLUMN IF NOT EXISTS data_atualizacao_saldo TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS usuario_atualizacao UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS log_migracao TEXT;

-- Alias e colunas geradas para aderência de nomenclatura da regra
DO $$
BEGIN
  -- valor_previsto: espelha valor_estimado
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contratacoes' AND column_name = 'valor_previsto'
  ) THEN
    ALTER TABLE public.contratacoes
      ADD COLUMN valor_previsto NUMERIC GENERATED ALWAYS AS (COALESCE(valor_estimado,0)) STORED;
  END IF;
  -- valor_executado: espelha valor_contratado
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contratacoes' AND column_name = 'valor_executado'
  ) THEN
    ALTER TABLE public.contratacoes
      ADD COLUMN valor_executado NUMERIC GENERATED ALWAYS AS (COALESCE(valor_contratado,0)) STORED;
  END IF;
  -- saldo_demanda: espelha saldo_orcamentario
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contratacoes' AND column_name = 'saldo_demanda'
  ) THEN
    ALTER TABLE public.contratacoes
      ADD COLUMN saldo_demanda NUMERIC GENERATED ALWAYS AS (COALESCE(saldo_orcamentario,0)) STORED;
  END IF;
END$$;

-- Função de bloqueio por UO (reserva e saldo por UO)
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

  -- reservado total atual da UO (somatório considerando etapa)
  SELECT COALESCE(SUM(
    CASE
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
    IF OLD.etapa_processo IN ('Contratado','Concluído') THEN
      old_reserved := COALESCE(OLD.valor_contratado,0);
    ELSIF OLD.etapa_processo = 'Cancelada' THEN
      old_reserved := 0;
    ELSE
      old_reserved := COALESCE(OLD.valor_estimado,0);
    END IF;
  END IF;

  -- reservado novo
  IF NEW.etapa_processo IN ('Contratado','Concluído') THEN
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

-- Recalcular status financeiro da contratação por UO
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

  -- reservado total atual da UO (somatório considerando etapa)
  SELECT COALESCE(SUM(
    CASE
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
  -- Regra central:
  -- - Se cancelada, saldo = 0
  -- - Caso contrário, saldo = previsto - executado
  IF NEW.etapa_processo = 'Cancelada' THEN
    NEW.saldo_orcamentario := 0;
  ELSE
    NEW.saldo_orcamentario := COALESCE(NEW.valor_estimado, 0) - COALESCE(NEW.valor_contratado, 0);
  END IF;
  NEW.status_financeiro := CASE WHEN v_saldo >= 0 THEN 'OK' ELSE 'INSUFICIENTE' END;
  -- Auditoria de atualização de saldo
  NEW.data_atualizacao_saldo := NOW();
  NEW.usuario_atualizacao := auth.uid();
  RETURN NEW;
END;
$$;

-- Orçamento setorial por UO
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

-- Saldo da UO por demanda (Σ saldos de cada demanda + excedentes)
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
            WHEN c.etapa_processo = 'Cancelada' THEN COALESCE(c.valor_estimado,0) -- retorna previsto integralmente
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

-- Saldo total do setor (Σ saldos de demandas + excedentes do setor)
CREATE OR REPLACE FUNCTION public.saldo_setor(p_setor TEXT)
RETURNS TABLE (
  setor_requisitante TEXT,
  total_previsto NUMERIC,
  total_executado NUMERIC,
  saldo_total NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT 
      COALESCE(SUM(CASE WHEN c.etapa_processo = 'Cancelada' THEN COALESCE(c.valor_estimado,0) ELSE COALESCE(c.valor_estimado,0) - COALESCE(c.valor_contratado,0) END),0) AS saldo,
      COALESCE(SUM(CASE WHEN c.etapa_processo = 'Cancelada' THEN 0 ELSE COALESCE(c.valor_estimado,0) END),0) AS previsto,
      COALESCE(SUM(CASE WHEN c.etapa_processo = 'Cancelada' THEN 0 ELSE COALESCE(c.valor_contratado,0) END),0) AS executado
    FROM public.contratacoes c
    WHERE c.setor_requisitante = p_setor
  )
  SELECT 
    p_setor AS setor_requisitante,
    base.previsto AS total_previsto,
    base.executado AS total_executado,
    base.saldo AS saldo_total;
$$;

-- Relatório de recalculo de saldos (para auditoria pós-migração)
CREATE OR REPLACE FUNCTION public.relatorio_recalculo_saldos(p_setor TEXT DEFAULT NULL)
RETURNS TABLE (
  setor_requisitante TEXT,
  total_previsto NUMERIC,
  total_executado NUMERIC,
  excedentes_autorizados NUMERIC,
  saldo_recalculado NUMERIC,
  discrepancias BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH filtrado AS (
    SELECT * FROM public.contratacoes c
    WHERE (p_setor IS NULL OR c.setor_requisitante = p_setor)
  ),
  agreg AS (
    SELECT 
      f.setor_requisitante,
      COALESCE(SUM(CASE WHEN f.etapa_processo = 'Cancelada' THEN 0 ELSE COALESCE(f.valor_estimado,0) END),0) AS total_previsto,
      COALESCE(SUM(CASE WHEN f.etapa_processo = 'Cancelada' THEN 0 ELSE COALESCE(f.valor_contratado,0) END),0) AS total_executado
    FROM filtrado f
    GROUP BY f.setor_requisitante
  ),
  disc AS (
    SELECT 
      c.setor_requisitante,
      COUNT(*)::BIGINT AS discrepancias
    FROM filtrado c
    WHERE (
      (c.etapa_processo = 'Cancelada' AND COALESCE(c.saldo_orcamentario,0) <> 0)
      OR (c.etapa_processo <> 'Cancelada' AND COALESCE(c.saldo_orcamentario,0) <> (COALESCE(c.valor_estimado,0) - COALESCE(c.valor_contratado,0)))
    )
    GROUP BY c.setor_requisitante
  )
  SELECT 
    a.setor_requisitante,
    a.total_previsto,
    a.total_executado,
    (SELECT COALESCE(SUM(CASE WHEN c.etapa_processo = 'Cancelada' THEN COALESCE(c.valor_estimado,0) ELSE COALESCE(c.valor_estimado,0) - COALESCE(c.valor_contratado,0) END),0)
       FROM public.contratacoes c
       WHERE c.setor_requisitante = a.setor_requisitante
    ) AS saldo_recalculado,
    COALESCE(d.discrepancias,0) AS discrepancias
  FROM agreg a
  LEFT JOIN disc d ON d.setor_requisitante = a.setor_requisitante
  ORDER BY a.setor_requisitante;
$$;

-- Função de backfill para disparar recalculo em massa e registrar migração
CREATE OR REPLACE FUNCTION public.backfill_recalculo_saldos(p_setor TEXT DEFAULT NULL, p_observacao TEXT DEFAULT NULL)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_count BIGINT;
BEGIN
  UPDATE public.contratacoes c
  SET 
    valor_estimado = c.valor_estimado,
    valor_contratado = c.valor_contratado,
    log_migracao = COALESCE(p_observacao, 'backfill-saldos')
  WHERE (p_setor IS NULL OR c.setor_requisitante = p_setor);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMIT;