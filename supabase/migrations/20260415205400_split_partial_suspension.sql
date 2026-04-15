BEGIN;

-- 1. Criação da tabela de auditoria relacao_sobrestamento
CREATE TABLE IF NOT EXISTS public.relacao_sobrestamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contratacao_origem UUID REFERENCES public.contratacoes(id),
  contratacao_filha UUID REFERENCES public.contratacoes(id),
  quantidade_transferida NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar novas colunas em contratacoes
ALTER TABLE public.contratacoes
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.contratacoes(id),
  ADD COLUMN IF NOT EXISTS data_migracao_sobrestamento TIMESTAMP WITH TIME ZONE;

-- 3. Atualizar/Recriar a constraint de etapa_processo para incluir 'SOBRESTADO_PARCIAL'
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_etapa_processo_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_etapa_processo_check 
  CHECK (etapa_processo IN (
    'Planejamento', 
    'Iniciado', 
    'Retornado para Diligência', 
    'Em Licitação', 
    'Contratado', 
    'Concluído',
    'Planejada', 
    'Processo Administrativo Iniciado',
    'Fase Externa da Licitação', 
    'Licitação Concluída', 
    'Ata Registrada', 
    'Cancelada',
    'SOBRESTADO_PARCIAL' -- Novo status para o registro filho
  ));

-- 4. Criar a Function / RPC sobrestar_parcial
CREATE OR REPLACE FUNCTION public.sobrestar_parcial(p_id UUID, p_quantidade NUMERIC)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_origem RECORD;
  v_nova_id UUID;
  v_user_id UUID := auth.uid();
  v_codigo_novo TEXT;
BEGIN
  -- Validar permissão
  IF NOT public.has_role(v_user_id, 'gestor') 
     AND NOT public.has_role(v_user_id, 'administrador')
     AND NOT public.has_role(v_user_id, 'setor_requisitante') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Buscar dados originais
  SELECT * INTO v_origem FROM public.contratacoes WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contratação não encontrada';
  END IF;

  IF p_quantidade <= 0 OR p_quantidade >= v_origem.quantidade_itens THEN
    RAISE EXCEPTION 'Quantidade a sobrestar deve ser maior que zero e menor que a quantidade total (%).', v_origem.quantidade_itens;
  END IF;

  -- Gerar novo ID
  v_nova_id := gen_random_uuid();
  
  -- Gerar novo código
  IF v_origem.codigo IS NOT NULL THEN
    v_codigo_novo := v_origem.codigo || '-SOB-' || (extract(epoch from now())::int % 10000)::text;
  ELSE
    v_codigo_novo := SUBSTRING(p_id::text, 1, 8) || '-SOB-' || (extract(epoch from now())::int % 10000)::text;
  END IF;

  -- 1) INSERIR a filha
  INSERT INTO public.contratacoes (
    id, codigo, descricao, pdm_catser, classe, tipo_material_servico, justificativa,
    unidade_orcamentaria, setor_requisitante, unidade_beneficiaria, setor_atual,
    tipo_contratacao, numero_contrato, modo_prestacao,
    quantidade_itens, valor_unitario, valor_estimado,
    unidade_fornecimento, tipo_recurso, modalidade, normativo,
    grau_prioridade, etapa_processo, sobrestado, tipo_sobrestamento,
    srp, alinhamento_estrategico, created_by, created_at, updated_at,
    parent_id
  ) VALUES (
    v_nova_id, v_codigo_novo, v_origem.descricao, v_origem.pdm_catser, v_origem.classe, v_origem.tipo_material_servico, v_origem.justificativa,
    v_origem.unidade_orcamentaria, v_origem.setor_requisitante, v_origem.unidade_beneficiaria, v_origem.setor_atual,
    v_origem.tipo_contratacao, v_origem.numero_contrato, v_origem.modo_prestacao,
    p_quantidade, v_origem.valor_unitario, (p_quantidade * v_origem.valor_unitario),
    v_origem.unidade_fornecimento, v_origem.tipo_recurso, v_origem.modalidade, v_origem.normativo,
    v_origem.grau_prioridade, 'SOBRESTADO_PARCIAL', true, 'parcial',
    v_origem.srp, v_origem.alinhamento_estrategico, v_user_id, NOW(), NOW(),
    p_id
  );

  -- Inserir na tabela de auditoria
  INSERT INTO public.relacao_sobrestamento (contratacao_origem, contratacao_filha, quantidade_transferida)
  VALUES (p_id, v_nova_id, p_quantidade);

  -- Registrar histórico na filha
  INSERT INTO public.contratacoes_historico (contratacao_id, user_id, acao, dados_anteriores, dados_novos)
  VALUES (v_nova_id, v_user_id, 'Criação', '{}'::jsonb, jsonb_build_object('nota', 'Filha de ' || p_id || ' via sobrestamento parcial'));

  -- Registrar histórico na original
  INSERT INTO public.contratacoes_historico (contratacao_id, user_id, acao, dados_anteriores, dados_novos)
  VALUES (p_id, v_user_id, 'Edição', jsonb_build_object('quantidade_itens', v_origem.quantidade_itens), jsonb_build_object('quantidade_itens', v_origem.quantidade_itens - p_quantidade, 'nota', 'Sobrestamento parcial (Filha ' || v_nova_id || ')'));

  -- 2) ATUALIZAR a original
  UPDATE public.contratacoes
  SET 
    quantidade_itens = quantidade_itens - p_quantidade,
    valor_estimado = (quantidade_itens - p_quantidade) * valor_unitario,
    updated_at = NOW()
  WHERE id = p_id;

  RETURN v_nova_id;
END;
$$;

-- 5. Atualizar backfills (Script one-time migrations)
DO $$
DECLARE
  v_rec RECORD;
  v_nova_id UUID;
  v_codigo_novo TEXT;
BEGIN
  FOR v_rec IN 
    SELECT * FROM public.contratacoes 
    WHERE sobrestado = true AND tipo_sobrestamento = 'parcial' AND quantidade_sobrestada > 0
  LOOP
    v_nova_id := gen_random_uuid();
    
    IF v_rec.codigo IS NOT NULL THEN
      v_codigo_novo := v_rec.codigo || '-SOB-' || (extract(epoch from now())::int % 10000)::text;
    ELSE
      v_codigo_novo := SUBSTRING(v_rec.id::text, 1, 8) || '-SOB-' || (extract(epoch from now())::int % 10000)::text;
    END IF;

    -- Cria o filho com a mesma logica
    INSERT INTO public.contratacoes (
      id, codigo, descricao, pdm_catser, classe, tipo_material_servico, justificativa,
      unidade_orcamentaria, setor_requisitante, unidade_beneficiaria, setor_atual,
      tipo_contratacao, numero_contrato, modo_prestacao,
      quantidade_itens, valor_unitario, valor_estimado,
      unidade_fornecimento, tipo_recurso, modalidade, normativo,
      grau_prioridade, etapa_processo, sobrestado, tipo_sobrestamento,
      srp, alinhamento_estrategico, created_by, created_at, updated_at,
      parent_id
    ) VALUES (
      v_nova_id, v_codigo_novo, v_rec.descricao, v_rec.pdm_catser, v_rec.classe, v_rec.tipo_material_servico, v_rec.justificativa,
      v_rec.unidade_orcamentaria, v_rec.setor_requisitante, v_rec.unidade_beneficiaria, v_rec.setor_atual,
      v_rec.tipo_contratacao, v_rec.numero_contrato, v_rec.modo_prestacao,
      v_rec.quantidade_sobrestada, v_rec.valor_unitario, v_rec.valor_sobrestado,
      v_rec.unidade_fornecimento, v_rec.tipo_recurso, v_rec.modalidade, v_rec.normativo,
      v_rec.grau_prioridade, 'SOBRESTADO_PARCIAL', true, 'parcial',
      v_rec.srp, v_rec.alinhamento_estrategico, v_rec.created_by, NOW(), NOW(),
      v_rec.id
    );

    INSERT INTO public.relacao_sobrestamento (contratacao_origem, contratacao_filha, quantidade_transferida, created_at)
    VALUES (v_rec.id, v_nova_id, v_rec.quantidade_sobrestada, NOW());

    -- Restaura a original e marca a migração
    UPDATE public.contratacoes
    SET
      sobrestado = false,
      tipo_sobrestamento = NULL,
      quantidade_itens = COALESCE(quantidade_ativa, quantidade_itens - quantidade_sobrestada),
      valor_estimado = COALESCE(valor_ativo, valor_estimado - valor_sobrestado),
      data_migracao_sobrestamento = NOW()
    WHERE id = v_rec.id;
  END LOOP;
END;
$$;

-- 6. Simplificar as regras Orcamentarias nas funções
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
  SELECT COALESCE(valor_aprovado, 0) INTO v_orcamento_aprovado
  FROM public.orcamentos_uo
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  SELECT COALESCE(SUM(valor_adicional), 0) INTO v_excedentes
  FROM public.excedentes_autorizados
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  SELECT COALESCE(SUM(
    CASE
      WHEN sobrestado = true THEN 0
      WHEN etapa_processo IN ('Contratado','Concluído') THEN COALESCE(valor_contratado,0)
      WHEN etapa_processo = 'Cancelada' THEN 0
      ELSE COALESCE(valor_estimado,0)
    END
  ), 0)
  INTO v_reservado_total
  FROM public.contratacoes
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.sobrestado = true THEN
      old_reserved := 0;
    ELSIF OLD.etapa_processo IN ('Contratado','Concluído') THEN
      old_reserved := COALESCE(OLD.valor_contratado,0);
    ELSIF OLD.etapa_processo = 'Cancelada' THEN
      old_reserved := 0;
    ELSE
      old_reserved := COALESCE(OLD.valor_estimado,0);
    END IF;
  END IF;

  IF NEW.sobrestado = true THEN
    new_reserved := 0;
  ELSIF NEW.etapa_processo IN ('Contratado','Concluído') THEN
    new_reserved := COALESCE(NEW.valor_contratado,0);
  ELSIF NEW.etapa_processo = 'Cancelada' THEN
    new_reserved := 0;
  ELSE
    new_reserved := COALESCE(NEW.valor_estimado,0);
  END IF;

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
  SELECT COALESCE(valor_aprovado, 0) INTO v_orcamento_aprovado
  FROM public.orcamentos_uo
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  SELECT COALESCE(SUM(valor_adicional), 0) INTO v_excedentes
  FROM public.excedentes_autorizados
  WHERE setor_requisitante = NEW.setor_requisitante
    AND unidade_orcamentaria = NEW.unidade_orcamentaria;

  SELECT COALESCE(SUM(
    CASE
      WHEN sobrestado = true THEN 0
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
  
  IF NEW.etapa_processo = 'Cancelada' OR NEW.sobrestado = true THEN
    NEW.saldo_orcamentario := 0;
  ELSE
    NEW.saldo_orcamentario := COALESCE(NEW.valor_estimado, 0) - COALESCE(NEW.valor_contratado, 0);
  END IF;

  NEW.status_financeiro := CASE WHEN v_saldo >= 0 THEN 'OK' ELSE 'INSUFICIENTE' END;
  NEW.data_atualizacao_saldo := NOW();
  NEW.usuario_atualizacao := auth.uid();
  RETURN NEW;
END;
$$;

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
          WHEN c.sobrestado = true THEN 0
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
          AND c.sobrestado = false
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
            WHEN c.sobrestado = true OR c.etapa_processo = 'Cancelada' THEN COALESCE(c.valor_estimado,0) 
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
