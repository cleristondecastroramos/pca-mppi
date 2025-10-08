-- Core Orçamentário PCA 2026: tabelas, funções, triggers e políticas
BEGIN;

-- Tabela de excedentes autorizados (apenas administradores podem inserir)
CREATE TABLE IF NOT EXISTS public.excedentes_autorizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setor_requisitante TEXT NOT NULL,
  contratacao_id UUID NULL REFERENCES public.contratacoes(id) ON DELETE SET NULL,
  valor_adicional DECIMAL(15, 2) NOT NULL CHECK (valor_adicional > 0),
  justificativa TEXT NOT NULL,
  approved_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.excedentes_autorizados ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para excedentes
DROP POLICY IF EXISTS "Excedentes: todos autenticados podem ver" ON public.excedentes_autorizados;
CREATE POLICY "Excedentes: todos autenticados podem ver"
  ON public.excedentes_autorizados FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Excedentes: somente administradores podem inserir" ON public.excedentes_autorizados;
CREATE POLICY "Excedentes: somente administradores podem inserir"
  ON public.excedentes_autorizados FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'administrador'::public.perfil_acesso));

DROP POLICY IF EXISTS "Excedentes: somente administradores podem atualizar" ON public.excedentes_autorizados;
CREATE POLICY "Excedentes: somente administradores podem atualizar"
  ON public.excedentes_autorizados FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'::public.perfil_acesso));

DROP POLICY IF EXISTS "Excedentes: somente administradores podem deletar" ON public.excedentes_autorizados;
CREATE POLICY "Excedentes: somente administradores podem deletar"
  ON public.excedentes_autorizados FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'::public.perfil_acesso));

-- Ampliar valores válidos de etapa_processo para incluir Cancelada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'contratacoes' AND constraint_name = 'contratacoes_etapa_processo_check'
  ) THEN
    ALTER TABLE public.contratacoes DROP CONSTRAINT contratacoes_etapa_processo_check;
  END IF;
END$$;

ALTER TABLE public.contratacoes
  ALTER COLUMN etapa_processo TYPE TEXT,
  ADD CONSTRAINT contratacoes_etapa_processo_check CHECK (
    etapa_processo IN ('Planejamento', 'Em Licitação', 'Contratado', 'Concluído', 'Cancelada')
  );

-- Adicionar coluna de status financeiro e calcular automaticamente
ALTER TABLE public.contratacoes
  ADD COLUMN IF NOT EXISTS status_financeiro TEXT;

-- Função: recalcular saldo por demanda e definir status financeiro
CREATE OR REPLACE FUNCTION public.recalcula_contratacao_financeiro()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.saldo_orcamentario := COALESCE(NEW.valor_estimado, 0) - COALESCE(NEW.valor_contratado, 0);
  IF COALESCE(NEW.valor_contratado, 0) < COALESCE(NEW.valor_estimado, 0) THEN
    NEW.status_financeiro := 'Abaixo do previsto';
  ELSIF COALESCE(NEW.valor_contratado, 0) = COALESCE(NEW.valor_estimado, 0) THEN
    NEW.status_financeiro := 'Igual ao previsto';
  ELSE
    NEW.status_financeiro := 'Acima do previsto';
  END IF;
  RETURN NEW;
END;
$$;

-- Função: calcular orçamento setorial (aprovado, executado, saldo, excedentes, %) 
CREATE OR REPLACE FUNCTION public.orcamento_setorial(p_setor TEXT)
RETURNS TABLE (
  total_aprovado NUMERIC,
  total_executado NUMERIC,
  excedentes_autorizados NUMERIC,
  saldo_disponivel NUMERIC,
  percent_execucao NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      COALESCE((SELECT SUM(c.valor_estimado) FROM public.contratacoes c WHERE c.setor_requisitante = p_setor), 0) AS aprovado,
      COALESCE((SELECT SUM(c.valor_contratado) FROM public.contratacoes c WHERE c.setor_requisitante = p_setor), 0) AS executado,
      COALESCE((SELECT SUM(e.valor_adicional) FROM public.excedentes_autorizados e WHERE e.setor_requisitante = p_setor), 0) AS excedentes
  )
  SELECT
    aprovado AS total_aprovado,
    executado AS total_executado,
    excedentes AS excedentes_autorizados,
    (aprovado + excedentes - executado) AS saldo_disponivel,
    CASE WHEN (aprovado + excedentes) > 0 THEN (executado / (aprovado + excedentes)) * 100 ELSE 0 END AS percent_execucao
  FROM base;
$$;

-- Função: bloquear extrapolação orçamentária para não administradores
CREATE OR REPLACE FUNCTION public.check_orcamento_limite()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_aprovado NUMERIC := 0;
  v_executado NUMERIC := 0;
  v_excedentes NUMERIC := 0;
  v_executado_ajustado NUMERIC := 0;
  is_admin BOOLEAN := public.has_role(auth.uid(), 'administrador'::public.perfil_acesso);
BEGIN
  SELECT COALESCE(SUM(valor_estimado), 0) INTO v_aprovado
  FROM public.contratacoes
  WHERE setor_requisitante = NEW.setor_requisitante;

  SELECT COALESCE(SUM(valor_contratado), 0) INTO v_executado
  FROM public.contratacoes
  WHERE setor_requisitante = NEW.setor_requisitante;

  SELECT COALESCE(SUM(valor_adicional), 0) INTO v_excedentes
  FROM public.excedentes_autorizados
  WHERE setor_requisitante = NEW.setor_requisitante;

  -- Ajustar executado com o novo valor da linha
  IF TG_OP = 'UPDATE' THEN
    v_executado_ajustado := v_executado - COALESCE(OLD.valor_contratado, 0) + COALESCE(NEW.valor_contratado, 0);
  ELSE
    v_executado_ajustado := v_executado + COALESCE(NEW.valor_contratado, 0);
  END IF;

  IF NOT is_admin AND v_executado_ajustado > (v_aprovado + v_excedentes) THEN
    RAISE EXCEPTION 'Saldo orçamentário insuficiente para esta operação. Solicite autorização do administrador.';
  END IF;
  RETURN NEW;
END;
$$;

-- Função de auditoria (security definer) para registrar alterações automaticamente
CREATE OR REPLACE FUNCTION public.log_contratacao_audit()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acao TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_acao := 'Criação';
    INSERT INTO public.contratacoes_historico(contratacao_id, user_id, acao, dados_anteriores, dados_novos)
    VALUES (NEW.id, auth.uid(), v_acao, NULL, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.etapa_processo IS DISTINCT FROM NEW.etapa_processo AND NEW.etapa_processo = 'Cancelada' THEN
      v_acao := 'Cancelamento';
    ELSE
      v_acao := 'Edição';
    END IF;
    INSERT INTO public.contratacoes_historico(contratacao_id, user_id, acao, dados_anteriores, dados_novos)
    VALUES (NEW.id, auth.uid(), v_acao, to_jsonb(OLD), to_jsonb(NEW));
  END IF;
  RETURN NEW;
END;
$$;

-- Triggers na tabela contratacoes
DROP TRIGGER IF EXISTS trg_contratacoes_recalcula ON public.contratacoes;
CREATE TRIGGER trg_contratacoes_recalcula
  BEFORE INSERT OR UPDATE ON public.contratacoes
  FOR EACH ROW EXECUTE FUNCTION public.recalcula_contratacao_financeiro();

DROP TRIGGER IF EXISTS trg_contratacoes_bloqueio_orcamento ON public.contratacoes;
CREATE TRIGGER trg_contratacoes_bloqueio_orcamento
  BEFORE INSERT OR UPDATE ON public.contratacoes
  FOR EACH ROW EXECUTE FUNCTION public.check_orcamento_limite();

DROP TRIGGER IF EXISTS trg_contratacoes_audit ON public.contratacoes;
CREATE TRIGGER trg_contratacoes_audit
  AFTER INSERT OR UPDATE ON public.contratacoes
  FOR EACH ROW EXECUTE FUNCTION public.log_contratacao_audit();

COMMIT;