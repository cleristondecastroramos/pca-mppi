BEGIN;

CREATE OR REPLACE FUNCTION public.reativar_suspensao(p_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alvo RECORD;
  v_pai RECORD;
  v_user_id UUID := auth.uid();
BEGIN
  -- Validar permissão
  IF NOT public.has_role(v_user_id, 'gestor') 
     AND NOT public.has_role(v_user_id, 'administrador')
     AND NOT public.has_role(v_user_id, 'setor_requisitante') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Buscar dados originais do alvo
  SELECT * INTO v_alvo FROM public.contratacoes WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'A demanda não foi encontrada na base.';
  END IF;

  IF v_alvo.sobrestado IS NOT TRUE THEN
    RAISE EXCEPTION 'Esta demanda não está marcada como suspensa/sobrestada.';
  END IF;

  -- Verifica se é Filha (Parcial) ou Pai (Total)
  IF v_alvo.parent_id IS NOT NULL THEN
    -- CENÁRIO A: É uma Suspensão Parcial (Filha)
    -- 1. Buscamos o Pai
    SELECT * INTO v_pai FROM public.contratacoes WHERE id = v_alvo.parent_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Demanda de origem (Pai) não encontrada. Inconsistência de banco.';
    END IF;

    -- 2. Registrar no Histórico do Pai (Fusão Reversa)
    INSERT INTO public.contratacoes_historico (contratacao_id, user_id, acao, dados_anteriores, dados_novos)
    VALUES (
      v_pai.id, v_user_id, 'Edição', 
      jsonb_build_object('quantidade_itens', v_pai.quantidade_itens), 
      jsonb_build_object(
        'quantidade_itens', v_pai.quantidade_itens + v_alvo.quantidade_itens, 
        'nota', 'Fusão reversa: ' || substring(p_id::text from 1 for 8) || '... reativada em ' || substring(v_pai.id::text from 1 for 8) || '..., +' || v_alvo.quantidade_itens || ' u. / R$ ' || ROUND(v_alvo.valor_estimado, 2)
      )
    );

    -- 3. Atualizar o Pai restituindo quantidade e valor
    UPDATE public.contratacoes
    SET 
      quantidade_itens = quantidade_itens + v_alvo.quantidade_itens,
      valor_estimado = (quantidade_itens + v_alvo.quantidade_itens) * valor_unitario,
      updated_at = NOW()
    WHERE id = v_pai.id;

    -- 4. Excluir Relacao e Deletar Filha fisicamente
    DELETE FROM public.relacao_sobrestamento WHERE contratacao_filha = p_id;
    
    -- Como a filha pode ter histórico gravado (na criação dela propria), limpamos o histórico atrelado a filha antes para evitar FK errors
    DELETE FROM public.contratacoes_historico WHERE contratacao_id = p_id;
    
    -- Finalmente limpamos a propria filha
    DELETE FROM public.contratacoes WHERE id = p_id;

  ELSE
    -- CENÁRIO B: É uma Suspensão Total (Demanda original)
    -- 1. Loga Histórico
    INSERT INTO public.contratacoes_historico (contratacao_id, user_id, acao, dados_anteriores, dados_novos)
    VALUES (
      v_alvo.id, v_user_id, 'Edição', 
      jsonb_build_object('sobrestado', true, 'etapa_processo', v_alvo.etapa_processo), 
      jsonb_build_object('sobrestado', false, 'etapa_processo', 'Planejamento', 'nota', 'Reativada de suspensão total')
    );

    -- 2. Reativar e forçar etapa_processo para Planejamento
    UPDATE public.contratacoes
    SET 
      sobrestado = false,
      tipo_sobrestamento = NULL,
      etapa_processo = 'Planejamento',
      updated_at = NOW()
    WHERE id = p_id;

  END IF;

  RETURN TRUE;
END;
$$;

COMMIT;
