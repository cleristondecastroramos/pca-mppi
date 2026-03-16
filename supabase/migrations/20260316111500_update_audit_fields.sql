-- Create a backup of the current state if needed
-- This migration will add the new audit fields to the contratacoes_conformidade table

ALTER TABLE public.contratacoes_conformidade 
ADD COLUMN IF NOT EXISTS termo_homologacao_licitacao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS termo_adjudicacao_licitacao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS documento_aceite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS justificativa_vantajosidade BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS declaracao_conformidade BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pesquisa_precos BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mapa_comparativo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS certidoes_habilitacao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS margem_calculo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parecer_orcamentario_financeiro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parecer_juridico_execucao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parecer_conint BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS oficio_autorizacao_empenho BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS atualizar_certidoes BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS termo_aditivo_apostilamento BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS publicacoes_execucao BOOLEAN DEFAULT FALSE;
