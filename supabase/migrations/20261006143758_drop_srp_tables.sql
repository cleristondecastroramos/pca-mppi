DROP VIEW IF EXISTS "srp_vw_extrato_ata" CASCADE;
DROP VIEW IF EXISTS "srp_vw_saldo_ata" CASCADE;

DROP TABLE IF EXISTS "srp_ata_adesao_itens" CASCADE;
DROP TABLE IF EXISTS "srp_ata_adesoes" CASCADE;
DROP TABLE IF EXISTS "srp_ata_empenho_itens" CASCADE;
DROP TABLE IF EXISTS "srp_ata_empenhos" CASCADE;
DROP TABLE IF EXISTS "srp_ata_itens_saldo" CASCADE;

DROP TABLE IF EXISTS "srp_execucao_item" CASCADE;
DROP TABLE IF EXISTS "srp_execucao_ata" CASCADE;
DROP TABLE IF EXISTS "srp_proposta_itens" CASCADE;
DROP TABLE IF EXISTS "srp_propostas" CASCADE;
DROP TABLE IF EXISTS "srp_negociacoes" CASCADE;
DROP TABLE IF EXISTS "srp_lances" CASCADE;
DROP TABLE IF EXISTS "srp_fases_historico" CASCADE;
DROP TABLE IF EXISTS "srp_ata_fornecedor_item" CASCADE;
DROP TABLE IF EXISTS "srp_atas_registro_preco" CASCADE;
DROP TABLE IF EXISTS "srp_itens" CASCADE;
DROP TABLE IF EXISTS "srp_lotes" CASCADE;
DROP TABLE IF EXISTS "srp_licitacoes" CASCADE;
DROP TABLE IF EXISTS "srp_fornecedores" CASCADE;
DROP TABLE IF EXISTS "srp_eventos_auditoria" CASCADE;
DROP TABLE IF EXISTS "srp_auditoria_log" CASCADE;
DROP TABLE IF EXISTS "srp_pca_itens_mock" CASCADE;

DROP TYPE IF EXISTS "srp_criterio_julgamento_enum" CASCADE;
DROP TYPE IF EXISTS "srp_fase_enum" CASCADE;
DROP TYPE IF EXISTS "srp_modalidade_enum" CASCADE;
DROP TYPE IF EXISTS "srp_status_proposta_enum" CASCADE;
DROP TYPE IF EXISTS "srp_tipo_cota_enum" CASCADE;
DROP TYPE IF EXISTS "srp_tipo_execucao_enum" CASCADE;
