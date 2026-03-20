-- Migration: SRP Bidding, Negotiation and Audit (Phase 3)
-- Compliance: Law 14.133/21, TCU Acórdãos, ME/EPP "Empate Ficto"

-- 1. Expanded Proposal Breakdown (Itemization)
CREATE TABLE IF NOT EXISTS srp_proposta_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposta_id UUID REFERENCES srp_propostas(id) ON DELETE CASCADE,
    item_id UUID REFERENCES srp_itens(id),
    valor_unitario NUMERIC(15,2) NOT NULL,
    quantidade NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bidding Session (Sala de Lances)
CREATE TABLE IF NOT EXISTS srp_lances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_id UUID REFERENCES srp_lotes(id),
    fornecedor_id UUID REFERENCES srp_fornecedores(id),
    valor_oferta NUMERIC(15,2) NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo_lance TEXT DEFAULT 'NORMAL', -- 'NORMAL', 'DESEMPATE_ME_EPP'
    ip_origem TEXT
);

-- 3. Negotiation Flow (Art. 61)
CREATE TABLE IF NOT EXISTS srp_negociacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposta_id UUID REFERENCES srp_propostas(id),
    valor_alvo NUMERIC(15,2) NOT NULL,
    mensagem_pregoeiro TEXT,
    resposta_fornecedor TEXT,
    aceito BOOLEAN,
    novo_valor_global NUMERIC(15,2),
    data_proposta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_resposta TIMESTAMP WITH TIME ZONE
);

-- 4. Status Tracking for Lots (Business State Machine)
ALTER TABLE srp_lotes 
ADD COLUMN IF NOT EXISTS status_disputa TEXT DEFAULT 'AGUARDANDO_ABERTURA', 
-- 'AGUARDANDO_ABERTURA', 'ABERTA', 'EM_DESEMPATE_ME_EPP', 'ENCERRADA', 'ADJUDICADA'
ADD COLUMN IF NOT EXISTS tempo_fim_desempate TIMESTAMP WITH TIME ZONE;

-- 5. Audit Log / Event Sourcing (Blindagem)
CREATE TABLE IF NOT EXISTS srp_eventos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidade_tipo TEXT NOT NULL, -- 'LICITACAO', 'PROPOSTA', 'LOTE', 'LANCE'
    entidade_id UUID NOT NULL,
    acao_tipo TEXT NOT NULL, -- 'DESCLASSIFICAR', 'NEGOCIAR', 'LANCE_ENVIADO', 'FIM_DISPUTA'
    ator_tipo TEXT NOT NULL, -- 'PREGOEIRO', 'FORNECEDOR', 'SISTEMA'
    ator_id UUID,
    payload_snapshot JSONB,
    hash_anterior TEXT, -- Para cadeias de integridade
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance and ranking
CREATE INDEX IF NOT EXISTS idx_lances_lote ON srp_lances(lote_id, valor_oferta ASC);
CREATE INDEX IF NOT EXISTS idx_propostas_ranking ON srp_propostas(lote_id, valor_ofertado ASC);
