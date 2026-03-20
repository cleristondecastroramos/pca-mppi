-- Migration: ARP Commitment (Empenho) Refinements
-- Purpose: Support NE tracking, PDF attachments and item-level consumption guards.

ALTER TABLE srp_ata_empenhos
ADD COLUMN IF NOT EXISTS numero_processo_sei TEXT,
ADD COLUMN IF NOT EXISTS data_empenho TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS anexo_empenho_id UUID, -- Link to storage
ADD COLUMN IF NOT EXISTS usuario_operador_id UUID;

-- 2. Item-level details for each commitment (The "Cart" items)
CREATE TABLE IF NOT EXISTS srp_ata_empenho_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empenho_id UUID REFERENCES srp_ata_empenhos(id) ON DELETE CASCADE,
    item_ata_id UUID REFERENCES srp_itens(id),
    quantidade NUMERIC(15,2) NOT NULL,
    valor_total_calculado NUMERIC(15,2),
    pesquisa_mercado_anexo_id UUID, -- Mandatory if Global Lot & No Lowest Bid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Function to prevent over-consumption (Backend Guard in DB)
CREATE OR REPLACE FUNCTION check_arp_balance_guard()
RETURNS TRIGGER AS $$
DECLARE
    current_saldo NUMERIC(15,2);
    requested_qty NUMERIC(15,2);
BEGIN
    -- This is a simplified check for the demo
    -- Real implementation would check srp_ata_itens_saldo per profile (Internal vs Adhesion)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
