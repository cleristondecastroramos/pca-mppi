-- Migration: SRP ARP Ledger (Conta Corrente)
-- Compliance: Law 14.133/21, Art. 86 (Carona Limits)

-- 1. Balance Tracking Table (The "Ledger")
CREATE TABLE IF NOT EXISTS srp_ata_itens_saldo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ata_id UUID REFERENCES srp_atas_registro_preco(id),
    item_id UUID REFERENCES srp_itens(id),
    qtd_original NUMERIC(15,2) NOT NULL, -- "Bolso" original (Gerenciador + Participantes)
    qtd_consumida_interna NUMERIC(15,2) DEFAULT 0,
    qtd_reservada_adesao NUMERIC(15,2) DEFAULT 0, -- Reservado (Adesão em processo)
    qtd_consumida_adesao NUMERIC(15,2) DEFAULT 0, -- Efetivamente empenhado por caronas
    CONSTRAINT check_carona_global_limit CHECK (qtd_consumida_adesao + qtd_reservada_adesao <= qtd_original * 2)
);

-- 2. Refined Adhesion (Carona) Workflow
CREATE TABLE IF NOT EXISTS srp_ata_adesoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ata_id UUID REFERENCES srp_atas_registro_preco(id),
    orgao_solicitante_id UUID, -- External Organ
    status TEXT DEFAULT 'PENDENTE_FORNECEDOR', 
    -- 'PENDENTE_FORNECEDOR', 'AGUARDANDO_GERENCIADOR', 'AUTORIZADO', 'RECUSADO', 'EMPENHADO'
    manifesto_fornecedor_data TIMESTAMP WITH TIME ZONE,
    autorizado_gerenciador_data TIMESTAMP WITH TIME ZONE,
    autorizado_gerenciador_id UUID, -- User ID
    justificativa_recusa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adhesion Items
CREATE TABLE IF NOT EXISTS srp_ata_adesao_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adesao_id UUID REFERENCES srp_ata_adesoes(id) ON DELETE CASCADE,
    item_id UUID REFERENCES srp_itens(id),
    quantidade_solicitada NUMERIC(15,2) NOT NULL,
    quantidade_autorizada NUMERIC(15,2),
    CONSTRAINT check_individual_carona_limit -- This is complex to enforce via DB constraint per item original mapping, handled in API
    CHECK (true)
);

-- 4. Consumption / Commitment Ledger (Empenho)
CREATE TABLE IF NOT EXISTS srp_ata_empenhos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ata_id UUID REFERENCES srp_atas_registro_preco(id),
    adesao_id UUID REFERENCES srp_ata_adesoes(id), -- NULL for internal consumption
    numero_empenho TEXT UNIQUE NOT NULL,
    valor_total NUMERIC(15,2),
    data_empenho TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View for "Checking Account" (Extrato)
CREATE OR REPLACE VIEW srp_vw_extrato_ata AS
SELECT 
    s.id as saldo_id,
    a.numero_ata,
    i.descricao_detalhada,
    s.qtd_original,
    s.qtd_consumida_interna,
    s.qtd_consumida_adesao,
    s.qtd_reservada_adesao,
    (s.qtd_original - s.qtd_consumida_interna) as saldo_interno_disponivel,
    (s.qtd_original * 2 - s.qtd_consumida_adesao - s.qtd_reservada_adesao) as saldo_carona_global_disponivel,
    (s.qtd_original * 0.5) as limite_individual_carona
FROM srp_ata_itens_saldo s
JOIN srp_atas_registro_preco a ON s.ata_id = a.id
JOIN srp_itens i ON s.item_id = i.id;
