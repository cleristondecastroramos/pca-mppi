-- Migration: SRP Bidding Creation Refinements
-- Purpose: Support SEI Process, PCA linkage, and Adhesion settings.

ALTER TABLE srp_licitacoes
ADD COLUMN IF NOT EXISTS numero_processo_sei TEXT UNIQUE, -- Unique SEI Process constraint
ADD COLUMN IF NOT EXISTS pca_item_id UUID, -- Link to PCA table
ADD COLUMN IF NOT EXISTS permite_adesao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS justificativa_adesao TEXT,
ADD COLUMN IF NOT EXISTS usuario_criador_id UUID;

-- Optional: Create a simple PCA table mockup if it doesn't exist
CREATE TABLE IF NOT EXISTS srp_pca_itens_mock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao TEXT NOT NULL,
    valor_estimado NUMERIC(15,2),
    setor_id TEXT,
    ano INTEGER DEFAULT 2026
);

-- Seed some PCA items for the demo modal
INSERT INTO srp_pca_itens_mock (descricao, valor_estimado, setor_id)
VALUES 
('Notebooks para Renovação de Parque Tecnológico', 1500000.00, 'CTI'),
('Monitores 27 polegadas 4K', 250000.00, 'CTI'),
('Mobiliário de Escritório (Cadeiras e Mesas)', 400000.00, 'SEC_ADMIN')
ON CONFLICT DO NOTHING;
