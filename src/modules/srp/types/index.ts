export type SrpFase = 'Planejamento' | 'Publicação' | 'Propostas' | 'Julgamento' | 'Homologação';
export type SrpEstrategiaAdjudicacao = 'POR_ITEM' | 'POR_GRUPO_GLOBAL';
export type SrpTipoLote = 'FATIADO_MESMO_OBJETO' | 'GRUPO_ITENS_AFINS';
export type SrpTipoCota = 'AMPLA_CONCORRENCIA' | 'EXCLUSIVA_ME_EPP' | 'RESERVADA_ME_EPP';

export interface SrpLicitacao {
  id: string;
  numero_ano: string;
  numero_processo_sei: string; 
  pca_item_id?: string; 
  modalidade: 'PREGAO' | 'CONCORRENCIA'; 
  criterio_julgamento: 'MENOR_PRECO' | 'MAIOR_DESCONTO'; 
  objeto: string;
  status_fase: SrpFase;
  unidade_demandante_id: string;
  permite_adesao: boolean; 
  justificativa_adesao?: string; 
  usuario_criador_id?: string;
  created_at: string;
}

export interface SrpAtaRegistroPreco {
  id: string;
  licitacao_id: string;
  numero_ata: string;
  data_assinatura: string;
  data_validade: string;
  status: 'Ativa' | 'Vencida' | 'Cancelada';
}

export interface SrpAtaItemSaldo {
  id: string;
  ata_id: string;
  item_id: string;
  qtd_original: number;
  qtd_consumida_interna: number;
  qtd_reservada_adesao: number;
  qtd_consumida_adesao: number;
  limite_individual_carona: number;
  // Metadata for UI
  item_descricao?: string;
  valor_unitario?: number;
  is_lote_global?: boolean;
  requer_pesquisa_mercado?: boolean;
}

export interface SrpAtaEmpenho {
  id: string;
  ata_id: string;
  adesao_id?: string;
  orgao_solicitante_id: string;
  tipo_orgao: 'GERENCIADOR' | 'PARTICIPANTE' | 'CARONA';
  numero_processo_sei: string;
  numero_empenho: string;
  data_empenho: string;
  anexo_empenho_id?: string;
  usuario_operador_id: string;
  itens: SrpAtaEmpenhoItem[];
}

export interface SrpAtaEmpenhoItem {
  id: string;
  empenho_id: string;
  item_ata_id: string;
  quantidade: number;
  valor_total_calculado: number;
  pesquisa_mercado_anexo_id?: string;
}

export interface SrpLote {
  id: string;
  licitacao_id: string;
  numero_lote: number;
  descricao: string;
  estrategia_adjudicacao: SrpEstrategiaAdjudicacao; 
  tipo_lote: SrpTipoLote; 
  tipo_cota: SrpTipoCota; 
  justificativa_agrupamento?: string; 
  local_entrega_id?: string;
  status_disputa?: string; 
  tempo_fim_desempate?: string;
}

export interface SrpItem {
  id: string;
  lote_id: string;
  numero_item: number;
  descricao: string;
  descricao_detalhada?: string;
  unidade_medida: string;
  quantidade: number;
  valor_estimado: number;
  menor_lance_valido_certame?: boolean;
}

export interface SrpProposta {
  id: string;
  licitacao_id: string;
  fornecedor_id: string;
  valor_ofertado: number;
  status: 'Vencedora' | 'Desclassificada' | 'Em Analise';
}

export interface SrpPropostaItem {
  id: string;
  proposta_id: string;
  item_id: string;
  valor_unitario: number;
  quantidade: number;
}

export interface SrpLance {
  id: string;
  lote_id: string;
  fornecedor_id: string;
  valor_oferta: number;
  data_hora: string;
  tipo_lance?: 'NORMAL' | 'DESEMPATE_ME_EPP';
}

export interface SrpNegociacao {
  id: string;
  proposta_id: string;
  valor_alvo: number;
  mensagem_pregoeiro?: string;
  resposta_fornecedor?: string;
  aceito?: boolean;
  novo_valor_global?: number;
}

export interface SrpAdesao {
  id: string;
  ata_id: string;
  orgao_solicitante_id: string;
  status: 'PENDENTE_FORNECEDOR' | 'AGUARDANDO_GERENCIADOR' | 'AUTORIZADO' | 'RECUSADO' | 'EMPENHADO';
}

export interface SrpAdesaoItem {
  id: string;
  adesao_id: string;
  item_id: string;
  quantidade_solicitada: number;
  quantidade_autorizada?: number;
}

export interface SrpPcaItem {
  id: string;
  descricao: string;
  valor_estimado: number;
  setor_id: string;
  ano: number;
}
