-- Atualizar demandas do PCA 2027 que foram cadastradas equivocadamente na CAA para o GSI

DO $$ 
DECLARE
  v_gsi_id UUID;
BEGIN
  -- Obter o ID do GSI para o exercicio 2027
  SELECT id INTO v_gsi_id
  FROM public.unidades_requisitantes
  WHERE nome = 'GSI' AND exercicio = 2027
  LIMIT 1;

  -- Fallback caso não encontre por exercicio
  IF v_gsi_id IS NULL THEN
    SELECT id INTO v_gsi_id
    FROM public.unidades_requisitantes
    WHERE nome = 'GSI'
    LIMIT 1;
  END IF;

  -- Se encontrou o ID do GSI, atualizar as demandas
  IF v_gsi_id IS NOT NULL THEN
    UPDATE public.contratacoes
    SET unidade_requisitante_id = v_gsi_id,
        setor_requisitante = 'GSI'
    WHERE (
      descricao ILIKE '%Estrutura para Monitores%' OR
      descricao ILIKE '%Conversor Imagem%' OR
      descricao ILIKE '%Monitor de Imagem%' OR
      descricao ILIKE '%Fragmentadora de Papel%' OR
      descricao ILIKE '%Fechadura%'
    ) AND exercicio = 2027;
  END IF;
END $$;
