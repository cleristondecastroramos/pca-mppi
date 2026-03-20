-- Migration: Refine SRP Module Schema
-- Purpose: Add support for adjudication strategies, lot types, and TCU validations.

-- 1. Refine srp_lotes
ALTER TABLE srp_lotes 
ADD COLUMN IF NOT EXISTS estrategia_adjudicacao TEXT CHECK (estrategia_adjudicacao IN ('POR_ITEM', 'POR_GRUPO_GLOBAL')) DEFAULT 'POR_ITEM',
ADD COLUMN IF NOT EXISTS tipo_lote TEXT CHECK (tipo_lote IN ('FATIADO_MESMO_OBJETO', 'GRUPO_ITENS_AFINS')),
ADD COLUMN IF NOT EXISTS justificativa_agrupamento TEXT,
ADD COLUMN IF NOT EXISTS tipo_cota TEXT CHECK (tipo_cota IN ('AMPLA_CONCORRENCIA', 'EXCLUSIVA_ME_EPP', 'RESERVADA_ME_EPP')) DEFAULT 'AMPLA_CONCORRENCIA',
ADD COLUMN IF NOT EXISTS local_entrega_id UUID; -- Assuming a locations table exists or will be added

-- 2. Refine srp_itens
ALTER TABLE srp_itens
ADD COLUMN IF NOT EXISTS menor_lance_valido_certame BOOLEAN DEFAULT FALSE;

-- 3. Validation Trigger for Justificativa Agrupamento
CREATE OR REPLACE FUNCTION check_justificativa_agrupamento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estrategia_adjudicacao = 'POR_GRUPO_GLOBAL' AND (NEW.justificativa_agrupamento IS NULL OR length(trim(NEW.justificativa_agrupamento)) = 0) THEN
    RAISE EXCEPTION 'Bloqueio TCU: Justificativa de agrupamento é obrigatória para Adjudicação por Grupo Global.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_valida_justificativa_agrupamento ON srp_lotes;
CREATE TRIGGER trg_valida_justificativa_agrupamento
BEFORE INSERT OR UPDATE ON srp_lotes
FOR EACH ROW EXECUTE FUNCTION check_justificativa_agrupamento();

-- 4. Audit Log for Adjudication Changes (Optional but recommended)
-- srp_auditoria_log can be used to track changes to adjudication strategies
