export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contratacoes: {
        Row: {
          ajuste_orcamentario: number | null
          alinhamento_estrategico: boolean | null
          classe: string
          codigo: string | null
          created_at: string | null
          created_by: string | null
          data_conclusao: string | null
          data_devolucao_fiscal: string | null
          data_entrada_clc: string | null
          data_envio_pgea: string | null
          data_finalizacao_licitacao: string | null
          data_prevista_contratacao: string | null
          data_termino_contrato: string | null
          descricao: string
          etapa_processo: string | null
          grau_prioridade: string
          houve_devolucao: boolean | null
          id: string
          justificativa: string
          modalidade: string
          modo_prestacao: string | null
          motivo_devolucao: string | null
          normativo: string | null
          numero_contrato: string | null
          numero_sei_contratacao: string | null
          numero_sei_licitacao: string | null
          pdm_catser: string | null
          quantidade_ativa: number | null
          quantidade_sobrestada: number | null
          quantidade_itens: number | null
          saldo_orcamentario: number | null
          setor_atual: string | null
          setor_requisitante: string
          sobrestado: boolean | null
          srp: boolean | null
          status_conclusao: string | null
          status_inicio: string | null
          tipo_contratacao: string
          tipo_material_servico: string | null
          tipo_sobrestamento: string | null
          tipo_recurso: string
          unidade_beneficiaria: string | null
          unidade_fornecimento: string | null
          unidade_orcamentaria: string
          updated_at: string | null
          valor_ativo: number | null
          valor_contratado: number | null
          valor_estimado: number
          valor_executado: number | null
          valor_licitado: number | null
          valor_sobrestado: number | null
          valor_unitario: number | null
        }
        Insert: {
          ajuste_orcamentario?: number | null
          alinhamento_estrategico?: boolean | null
          classe: string
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          data_conclusao?: string | null
          data_devolucao_fiscal?: string | null
          data_entrada_clc?: string | null
          data_envio_pgea?: string | null
          data_finalizacao_licitacao?: string | null
          data_prevista_contratacao?: string | null
          data_termino_contrato?: string | null
          descricao: string
          etapa_processo?: string | null
          grau_prioridade: string
          houve_devolucao?: boolean | null
          id?: string
          justificativa: string
          modalidade: string
          modo_prestacao?: string | null
          motivo_devolucao?: string | null
          normativo?: string | null
          numero_contrato?: string | null
          numero_sei_contratacao?: string | null
          numero_sei_licitacao?: string | null
          pdm_catser?: string | null
          quantidade_ativa?: number | null
          quantidade_sobrestada?: number | null
          quantidade_itens?: number | null
          saldo_orcamentario?: number | null
          setor_atual?: string | null
          setor_requisitante: string
          sobrestado?: boolean | null
          srp?: boolean | null
          status_conclusao?: string | null
          status_inicio?: string | null
          tipo_contratacao: string
          tipo_material_servico?: string | null
          tipo_sobrestamento?: string | null
          tipo_recurso: string
          unidade_beneficiaria?: string | null
          unidade_fornecimento?: string | null
          unidade_orcamentaria: string
          updated_at?: string | null
          valor_ativo?: number | null
          valor_contratado?: number | null
          valor_estimado: number
          valor_executado?: number | null
          valor_licitado?: number | null
          valor_sobrestado?: number | null
          valor_unitario?: number | null
        }
        Update: {
          ajuste_orcamentario?: number | null
          alinhamento_estrategico?: boolean | null
          classe?: string
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          data_conclusao?: string | null
          data_devolucao_fiscal?: string | null
          data_entrada_clc?: string | null
          data_envio_pgea?: string | null
          data_finalizacao_licitacao?: string | null
          data_prevista_contratacao?: string | null
          data_termino_contrato?: string | null
          descricao?: string
          etapa_processo?: string | null
          grau_prioridade?: string
          houve_devolucao?: boolean | null
          id?: string
          justificativa?: string
          modalidade?: string
          modo_prestacao?: string | null
          motivo_devolucao?: string | null
          normativo?: string | null
          numero_contrato?: string | null
          numero_sei_contratacao?: string | null
          numero_sei_licitacao?: string | null
          pdm_catser?: string | null
          quantidade_ativa?: number | null
          quantidade_sobrestada?: number | null
          quantidade_itens?: number | null
          saldo_orcamentario?: number | null
          setor_atual?: string | null
          setor_requisitante?: string
          sobrestado?: boolean | null
          srp?: boolean | null
          status_conclusao?: string | null
          status_inicio?: string | null
          tipo_contratacao?: string
          tipo_material_servico?: string | null
          tipo_sobrestamento?: string | null
          tipo_recurso?: string
          unidade_beneficiaria?: string | null
          unidade_fornecimento?: string | null
          unidade_orcamentaria?: string
          updated_at?: string | null
          valor_ativo?: number | null
          valor_contratado?: number | null
          valor_estimado?: number
          valor_executado?: number | null
          valor_licitado?: number | null
          valor_sobrestado?: number | null
          valor_unitario?: number | null
        }
        Relationships: []
      }
      contratacoes_conformidade: {
        Row: {
          assinatura_contrato: boolean | null
          atas_certame: boolean | null
          atos_autorizacao: boolean | null
          contratacao_id: string
          created_at: string | null
          documentacao_fornecedor: boolean | null
          id: string
          observacao: string | null
          pareceres_juridicos: boolean | null
          pesquisa_mercado: boolean | null
          publicacao_contrato: boolean | null
          publicacao_edital: boolean | null
          termo_adjudicacao: boolean | null
          termo_homologacao: boolean | null
          termo_referencia_aprovado: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assinatura_contrato?: boolean | null
          atas_certame?: boolean | null
          atos_autorizacao?: boolean | null
          contratacao_id: string
          created_at?: string | null
          documentacao_fornecedor?: boolean | null
          id?: string
          observacao?: string | null
          pareceres_juridicos?: boolean | null
          pesquisa_mercado?: boolean | null
          publicacao_contrato?: boolean | null
          publicacao_edital?: boolean | null
          termo_adjudicacao?: boolean | null
          termo_homologacao?: boolean | null
          termo_referencia_aprovado?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assinatura_contrato?: boolean | null
          atas_certame?: boolean | null
          atos_autorizacao?: boolean | null
          contratacao_id?: string
          created_at?: string | null
          documentacao_fornecedor?: boolean | null
          id?: string
          observacao?: string | null
          pareceres_juridicos?: boolean | null
          pesquisa_mercado?: boolean | null
          publicacao_contrato?: boolean | null
          publicacao_edital?: boolean | null
          termo_adjudicacao?: boolean | null
          termo_homologacao?: boolean | null
          termo_referencia_aprovado?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contratacoes_conformidade_contratacao_id_fkey"
            columns: ["contratacao_id"]
            isOneToOne: true
            referencedRelation: "contratacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      contratacoes_historico: {
        Row: {
          acao: string
          contratacao_id: string
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          user_id: string
        }
        Insert: {
          acao: string
          contratacao_id: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          acao?: string
          contratacao_id?: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contratacoes_historico_contratacao_id_fkey"
            columns: ["contratacao_id"]
            isOneToOne: false
            referencedRelation: "contratacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          ativa: boolean | null
          autor_id: string | null
          data_criacao: string
          id: string
          mensagem: string
          setor_destino: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          ativa?: boolean | null
          autor_id?: string | null
          data_criacao?: string
          id?: string
          mensagem: string
          setor_destino?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          ativa?: boolean | null
          autor_id?: string | null
          data_criacao?: string
          id?: string
          mensagem?: string
          setor_destino?: string | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes_lidas: {
        Row: {
          data_leitura: string
          notificacao_id: string
          usuario_id: string
        }
        Insert: {
          data_leitura?: string
          notificacao_id: string
          usuario_id: string
        }
        Update: {
          data_leitura?: string
          notificacao_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_lidas_notificacao_id_fkey"
            columns: ["notificacao_id"]
            isOneToOne: false
            referencedRelation: "notificacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_lidas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_planejado: {
        Row: {
          ano: number
          created_at: string
          id: string
          setor_requisitante: string
          trava_ativa: boolean
          valor_fepdc: number
          valor_fmmp: number
          valor_pgj: number
        }
        Insert: {
          ano?: number
          created_at?: string
          id?: string
          setor_requisitante: string
          trava_ativa?: boolean
          valor_fepdc?: number
          valor_fmmp?: number
          valor_pgj?: number
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          setor_requisitante?: string
          trava_ativa?: boolean
          valor_fepdc?: number
          valor_fmmp?: number
          valor_pgj?: number
        }
        Relationships: []
      }
      orcamento_planejado_auditoria: {
        Row: {
          ano: number
          data_alteracao: string
          id: string
          orcamento_id: string | null
          setor_requisitante: string
          trava_ativa_anterior: boolean | null
          trava_ativa_novo: boolean | null
          usuario_id: string | null
          valor_fepdc_anterior: number | null
          valor_fepdc_novo: number | null
          valor_fmmp_anterior: number | null
          valor_fmmp_novo: number | null
          valor_pgj_anterior: number | null
          valor_pgj_novo: number | null
        }
        Insert: {
          ano: number
          data_alteracao?: string
          id?: string
          orcamento_id?: string | null
          setor_requisitante: string
          trava_ativa_anterior?: boolean | null
          trava_ativa_novo?: boolean | null
          usuario_id?: string | null
          valor_fepdc_anterior?: number | null
          valor_fepdc_novo?: number | null
          valor_fmmp_anterior?: number | null
          valor_fmmp_novo?: number | null
          valor_pgj_anterior?: number | null
          valor_pgj_novo?: number | null
        }
        Update: {
          ano?: number
          data_alteracao?: string
          id?: string
          orcamento_id?: string | null
          setor_requisitante?: string
          trava_ativa_anterior?: boolean | null
          trava_ativa_novo?: boolean | null
          usuario_id?: string | null
          valor_fepdc_anterior?: number | null
          valor_fepdc_novo?: number | null
          valor_fmmp_anterior?: number | null
          valor_fmmp_novo?: number | null
          valor_pgj_anterior?: number | null
          valor_pgj_novo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_auditoria_usuario"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string | null
          email: string | null
          id: string
          nome_completo: string | null
          ramal: string | null
          setor: string | null
          setores_adicionais: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome_completo?: string | null
          ramal?: string | null
          setor?: string | null
          setores_adicionais?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome_completo?: string | null
          ramal?: string | null
          setor?: string | null
          setores_adicionais?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      srp_ata_adesao_itens: {
        Row: {
          adesao_id: string | null
          id: string
          item_id: string | null
          quantidade_autorizada: number | null
          quantidade_solicitada: number
        }
        Insert: {
          adesao_id?: string | null
          id?: string
          item_id?: string | null
          quantidade_autorizada?: number | null
          quantidade_solicitada: number
        }
        Update: {
          adesao_id?: string | null
          id?: string
          item_id?: string | null
          quantidade_autorizada?: number | null
          quantidade_solicitada?: number
        }
        Relationships: [
          {
            foreignKeyName: "srp_ata_adesao_itens_adesao_id_fkey"
            columns: ["adesao_id"]
            isOneToOne: false
            referencedRelation: "srp_ata_adesoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_ata_adesao_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "srp_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_ata_adesoes: {
        Row: {
          ata_id: string | null
          autorizado_gerenciador_data: string | null
          autorizado_gerenciador_id: string | null
          created_at: string | null
          id: string
          justificativa_recusa: string | null
          manifesto_fornecedor_data: string | null
          orgao_solicitante_id: string | null
          status: string | null
        }
        Insert: {
          ata_id?: string | null
          autorizado_gerenciador_data?: string | null
          autorizado_gerenciador_id?: string | null
          created_at?: string | null
          id?: string
          justificativa_recusa?: string | null
          manifesto_fornecedor_data?: string | null
          orgao_solicitante_id?: string | null
          status?: string | null
        }
        Update: {
          ata_id?: string | null
          autorizado_gerenciador_data?: string | null
          autorizado_gerenciador_id?: string | null
          created_at?: string | null
          id?: string
          justificativa_recusa?: string | null
          manifesto_fornecedor_data?: string | null
          orgao_solicitante_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "srp_ata_adesoes_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "srp_atas_registro_preco"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_ata_empenho_itens: {
        Row: {
          created_at: string | null
          empenho_id: string | null
          id: string
          item_ata_id: string | null
          pesquisa_mercado_anexo_id: string | null
          quantidade: number
          valor_total_calculado: number | null
        }
        Insert: {
          created_at?: string | null
          empenho_id?: string | null
          id?: string
          item_ata_id?: string | null
          pesquisa_mercado_anexo_id?: string | null
          quantidade: number
          valor_total_calculado?: number | null
        }
        Update: {
          created_at?: string | null
          empenho_id?: string | null
          id?: string
          item_ata_id?: string | null
          pesquisa_mercado_anexo_id?: string | null
          quantidade?: number
          valor_total_calculado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "srp_ata_empenho_itens_empenho_id_fkey"
            columns: ["empenho_id"]
            isOneToOne: false
            referencedRelation: "srp_ata_empenhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_ata_empenho_itens_item_ata_id_fkey"
            columns: ["item_ata_id"]
            isOneToOne: false
            referencedRelation: "srp_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_ata_empenhos: {
        Row: {
          adesao_id: string | null
          anexo_empenho_id: string | null
          ata_id: string | null
          data_empenho: string | null
          id: string
          numero_empenho: string
          numero_processo_sei: string | null
          usuario_operador_id: string | null
          valor_total: number | null
        }
        Insert: {
          adesao_id?: string | null
          anexo_empenho_id?: string | null
          ata_id?: string | null
          data_empenho?: string | null
          id?: string
          numero_empenho: string
          numero_processo_sei?: string | null
          usuario_operador_id?: string | null
          valor_total?: number | null
        }
        Update: {
          adesao_id?: string | null
          anexo_empenho_id?: string | null
          ata_id?: string | null
          data_empenho?: string | null
          id?: string
          numero_empenho?: string
          numero_processo_sei?: string | null
          usuario_operador_id?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "srp_ata_empenhos_adesao_id_fkey"
            columns: ["adesao_id"]
            isOneToOne: false
            referencedRelation: "srp_ata_adesoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_ata_empenhos_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "srp_atas_registro_preco"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_ata_fornecedor_item: {
        Row: {
          ata_id: string | null
          fornecedor_id: string | null
          id: string
          item_id: string | null
          ordem_classificacao: number | null
          quantidade_registrada: number
          valor_unitario_registrado: number
        }
        Insert: {
          ata_id?: string | null
          fornecedor_id?: string | null
          id?: string
          item_id?: string | null
          ordem_classificacao?: number | null
          quantidade_registrada: number
          valor_unitario_registrado: number
        }
        Update: {
          ata_id?: string | null
          fornecedor_id?: string | null
          id?: string
          item_id?: string | null
          ordem_classificacao?: number | null
          quantidade_registrada?: number
          valor_unitario_registrado?: number
        }
        Relationships: [
          {
            foreignKeyName: "srp_ata_fornecedor_item_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "srp_atas_registro_preco"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_ata_fornecedor_item_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "srp_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_ata_fornecedor_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "srp_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_ata_itens_saldo: {
        Row: {
          ata_id: string | null
          id: string
          item_id: string | null
          qtd_consumida_adesao: number | null
          qtd_consumida_interna: number | null
          qtd_original: number
          qtd_reservada_adesao: number | null
        }
        Insert: {
          ata_id?: string | null
          id?: string
          item_id?: string | null
          qtd_consumida_adesao?: number | null
          qtd_consumida_interna?: number | null
          qtd_original: number
          qtd_reservada_adesao?: number | null
        }
        Update: {
          ata_id?: string | null
          id?: string
          item_id?: string | null
          qtd_consumida_adesao?: number | null
          qtd_consumida_interna?: number | null
          qtd_original?: number
          qtd_reservada_adesao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "srp_ata_itens_saldo_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "srp_atas_registro_preco"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_ata_itens_saldo_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "srp_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_atas_registro_preco: {
        Row: {
          created_at: string | null
          data_assinatura: string
          data_validade: string
          id: string
          licitacao_id: string | null
          numero_ata: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          data_assinatura: string
          data_validade: string
          id?: string
          licitacao_id?: string | null
          numero_ata: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          data_assinatura?: string
          data_validade?: string
          id?: string
          licitacao_id?: string | null
          numero_ata?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "srp_atas_registro_preco_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "srp_licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_auditoria_log: {
        Row: {
          acao: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          registro_id: string
          tabela_afetada: string
          timestamp: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id: string
          tabela_afetada: string
          timestamp?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id?: string
          tabela_afetada?: string
          timestamp?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      srp_eventos_auditoria: {
        Row: {
          acao_tipo: string
          ator_id: string | null
          ator_tipo: string
          created_at: string | null
          entidade_id: string
          entidade_tipo: string
          hash_anterior: string | null
          id: string
          payload_snapshot: Json | null
        }
        Insert: {
          acao_tipo: string
          ator_id?: string | null
          ator_tipo: string
          created_at?: string | null
          entidade_id: string
          entidade_tipo: string
          hash_anterior?: string | null
          id?: string
          payload_snapshot?: Json | null
        }
        Update: {
          acao_tipo?: string
          ator_id?: string | null
          ator_tipo?: string
          created_at?: string | null
          entidade_id?: string
          entidade_tipo?: string
          hash_anterior?: string | null
          id?: string
          payload_snapshot?: Json | null
        }
        Relationships: []
      }
      srp_execucao_ata: {
        Row: {
          ata_id: string | null
          data_pedido: string | null
          id: string
          orgao_solicitante_id: string | null
          status: string | null
          tipo: Database["public"]["Enums"]["srp_tipo_execucao_enum"]
        }
        Insert: {
          ata_id?: string | null
          data_pedido?: string | null
          id?: string
          orgao_solicitante_id?: string | null
          status?: string | null
          tipo: Database["public"]["Enums"]["srp_tipo_execucao_enum"]
        }
        Update: {
          ata_id?: string | null
          data_pedido?: string | null
          id?: string
          orgao_solicitante_id?: string | null
          status?: string | null
          tipo?: Database["public"]["Enums"]["srp_tipo_execucao_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "srp_execucao_ata_ata_id_fkey"
            columns: ["ata_id"]
            isOneToOne: false
            referencedRelation: "srp_atas_registro_preco"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_execucao_item: {
        Row: {
          ata_fornecedor_item_id: string | null
          execucao_ata_id: string | null
          id: string
          quantidade_consumida: number
        }
        Insert: {
          ata_fornecedor_item_id?: string | null
          execucao_ata_id?: string | null
          id?: string
          quantidade_consumida: number
        }
        Update: {
          ata_fornecedor_item_id?: string | null
          execucao_ata_id?: string | null
          id?: string
          quantidade_consumida?: number
        }
        Relationships: [
          {
            foreignKeyName: "srp_execucao_item_ata_fornecedor_item_id_fkey"
            columns: ["ata_fornecedor_item_id"]
            isOneToOne: false
            referencedRelation: "srp_ata_fornecedor_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_execucao_item_ata_fornecedor_item_id_fkey"
            columns: ["ata_fornecedor_item_id"]
            isOneToOne: false
            referencedRelation: "srp_vw_saldo_ata"
            referencedColumns: ["ata_fornecedor_item_id"]
          },
          {
            foreignKeyName: "srp_execucao_item_execucao_ata_id_fkey"
            columns: ["execucao_ata_id"]
            isOneToOne: false
            referencedRelation: "srp_execucao_ata"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_fases_historico: {
        Row: {
          data_transicao: string | null
          fase_enum: Database["public"]["Enums"]["srp_fase_enum"]
          id: string
          justificativa: string
          licitacao_id: string | null
          usuario_id: string | null
        }
        Insert: {
          data_transicao?: string | null
          fase_enum: Database["public"]["Enums"]["srp_fase_enum"]
          id?: string
          justificativa: string
          licitacao_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          data_transicao?: string | null
          fase_enum?: Database["public"]["Enums"]["srp_fase_enum"]
          id?: string
          justificativa?: string
          licitacao_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "srp_fases_historico_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "srp_licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_fornecedores: {
        Row: {
          cnpj: string
          created_at: string | null
          id: string
          porte: string | null
          razao_social: string
          status_habilitacao: boolean | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          id?: string
          porte?: string | null
          razao_social: string
          status_habilitacao?: boolean | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          id?: string
          porte?: string | null
          razao_social?: string
          status_habilitacao?: boolean | null
        }
        Relationships: []
      }
      srp_itens: {
        Row: {
          codigo_catalogo: string | null
          descricao_detalhada: string
          id: string
          lote_id: string | null
          menor_lance_valido_certame: boolean | null
          numero_item: number
          quantidade_estimada: number
          unidade_medida: string
          valor_unitario_estimado: number
        }
        Insert: {
          codigo_catalogo?: string | null
          descricao_detalhada: string
          id?: string
          lote_id?: string | null
          menor_lance_valido_certame?: boolean | null
          numero_item: number
          quantidade_estimada: number
          unidade_medida: string
          valor_unitario_estimado: number
        }
        Update: {
          codigo_catalogo?: string | null
          descricao_detalhada?: string
          id?: string
          lote_id?: string | null
          menor_lance_valido_certame?: boolean | null
          numero_item?: number
          quantidade_estimada?: number
          unidade_medida?: string
          valor_unitario_estimado?: number
        }
        Relationships: [
          {
            foreignKeyName: "srp_itens_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "srp_lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_lances: {
        Row: {
          data_hora: string | null
          fornecedor_id: string | null
          id: string
          ip_origem: string | null
          lote_id: string | null
          tipo_lance: string | null
          valor_oferta: number
        }
        Insert: {
          data_hora?: string | null
          fornecedor_id?: string | null
          id?: string
          ip_origem?: string | null
          lote_id?: string | null
          tipo_lance?: string | null
          valor_oferta: number
        }
        Update: {
          data_hora?: string | null
          fornecedor_id?: string | null
          id?: string
          ip_origem?: string | null
          lote_id?: string | null
          tipo_lance?: string | null
          valor_oferta?: number
        }
        Relationships: [
          {
            foreignKeyName: "srp_lances_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "srp_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_lances_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "srp_lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_licitacoes: {
        Row: {
          criterio_julgamento: Database["public"]["Enums"]["srp_criterio_julgamento_enum"]
          data_criacao: string | null
          id: string
          justificativa_adesao: string | null
          modalidade: Database["public"]["Enums"]["srp_modalidade_enum"]
          numero_ano: string
          numero_processo_sei: string | null
          objeto: string
          pca_item_id: string | null
          permite_adesao: boolean | null
          status_fase: Database["public"]["Enums"]["srp_fase_enum"] | null
          unidade_demandante_id: string | null
          updated_at: string | null
          usuario_criador_id: string | null
        }
        Insert: {
          criterio_julgamento: Database["public"]["Enums"]["srp_criterio_julgamento_enum"]
          data_criacao?: string | null
          id?: string
          justificativa_adesao?: string | null
          modalidade: Database["public"]["Enums"]["srp_modalidade_enum"]
          numero_ano: string
          numero_processo_sei?: string | null
          objeto: string
          pca_item_id?: string | null
          permite_adesao?: boolean | null
          status_fase?: Database["public"]["Enums"]["srp_fase_enum"] | null
          unidade_demandante_id?: string | null
          updated_at?: string | null
          usuario_criador_id?: string | null
        }
        Update: {
          criterio_julgamento?: Database["public"]["Enums"]["srp_criterio_julgamento_enum"]
          data_criacao?: string | null
          id?: string
          justificativa_adesao?: string | null
          modalidade?: Database["public"]["Enums"]["srp_modalidade_enum"]
          numero_ano?: string
          numero_processo_sei?: string | null
          objeto?: string
          pca_item_id?: string | null
          permite_adesao?: boolean | null
          status_fase?: Database["public"]["Enums"]["srp_fase_enum"] | null
          unidade_demandante_id?: string | null
          updated_at?: string | null
          usuario_criador_id?: string | null
        }
        Relationships: []
      }
      srp_lotes: {
        Row: {
          descricao: string
          estrategia_adjudicacao: string | null
          id: string
          justificativa_agrupamento: string | null
          licitacao_id: string | null
          local_entrega_id: string | null
          numero_lote: number
          status_disputa: string | null
          tempo_fim_desempate: string | null
          tipo_cota: Database["public"]["Enums"]["srp_tipo_cota_enum"]
          tipo_lote: string | null
          valor_estimado_total: number | null
        }
        Insert: {
          descricao: string
          estrategia_adjudicacao?: string | null
          id?: string
          justificativa_agrupamento?: string | null
          licitacao_id?: string | null
          local_entrega_id?: string | null
          numero_lote: number
          status_disputa?: string | null
          tempo_fim_desempate?: string | null
          tipo_cota?: Database["public"]["Enums"]["srp_tipo_cota_enum"]
          tipo_lote?: string | null
          valor_estimado_total?: number | null
        }
        Update: {
          descricao?: string
          estrategia_adjudicacao?: string | null
          id?: string
          justificativa_agrupamento?: string | null
          licitacao_id?: string | null
          local_entrega_id?: string | null
          numero_lote?: number
          status_disputa?: string | null
          tempo_fim_desempate?: string | null
          tipo_cota?: Database["public"]["Enums"]["srp_tipo_cota_enum"]
          tipo_lote?: string | null
          valor_estimado_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "srp_lotes_licitacao_id_fkey"
            columns: ["licitacao_id"]
            isOneToOne: false
            referencedRelation: "srp_licitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_negociacoes: {
        Row: {
          aceito: boolean | null
          data_proposta: string | null
          data_resposta: string | null
          id: string
          mensagem_pregoeiro: string | null
          novo_valor_global: number | null
          proposta_id: string | null
          resposta_fornecedor: string | null
          valor_alvo: number
        }
        Insert: {
          aceito?: boolean | null
          data_proposta?: string | null
          data_resposta?: string | null
          id?: string
          mensagem_pregoeiro?: string | null
          novo_valor_global?: number | null
          proposta_id?: string | null
          resposta_fornecedor?: string | null
          valor_alvo: number
        }
        Update: {
          aceito?: boolean | null
          data_proposta?: string | null
          data_resposta?: string | null
          id?: string
          mensagem_pregoeiro?: string | null
          novo_valor_global?: number | null
          proposta_id?: string | null
          resposta_fornecedor?: string | null
          valor_alvo?: number
        }
        Relationships: [
          {
            foreignKeyName: "srp_negociacoes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "srp_propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_pca_itens_mock: {
        Row: {
          ano: number | null
          descricao: string
          id: string
          setor_id: string | null
          valor_estimado: number | null
        }
        Insert: {
          ano?: number | null
          descricao: string
          id?: string
          setor_id?: string | null
          valor_estimado?: number | null
        }
        Update: {
          ano?: number | null
          descricao?: string
          id?: string
          setor_id?: string | null
          valor_estimado?: number | null
        }
        Relationships: []
      }
      srp_proposta_itens: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          proposta_id: string | null
          quantidade: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          proposta_id?: string | null
          quantidade: number
          valor_unitario: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          proposta_id?: string | null
          quantidade?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "srp_proposta_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "srp_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "srp_propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      srp_propostas: {
        Row: {
          classificacao_final: number | null
          data_submissao: string | null
          fornecedor_id: string | null
          id: string
          item_id: string | null
          lote_id: string | null
          status: Database["public"]["Enums"]["srp_status_proposta_enum"] | null
          valor_ofertado: number
        }
        Insert: {
          classificacao_final?: number | null
          data_submissao?: string | null
          fornecedor_id?: string | null
          id?: string
          item_id?: string | null
          lote_id?: string | null
          status?:
            | Database["public"]["Enums"]["srp_status_proposta_enum"]
            | null
          valor_ofertado: number
        }
        Update: {
          classificacao_final?: number | null
          data_submissao?: string | null
          fornecedor_id?: string | null
          id?: string
          item_id?: string | null
          lote_id?: string | null
          status?:
            | Database["public"]["Enums"]["srp_status_proposta_enum"]
            | null
          valor_ofertado?: number
        }
        Relationships: [
          {
            foreignKeyName: "srp_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "srp_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_propostas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "srp_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srp_propostas_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "srp_lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["perfil_acesso"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["perfil_acesso"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["perfil_acesso"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      srp_vw_extrato_ata: {
        Row: {
          descricao_detalhada: string | null
          limite_individual_carona: number | null
          numero_ata: string | null
          qtd_consumida_adesao: number | null
          qtd_consumida_interna: number | null
          qtd_original: number | null
          qtd_reservada_adesao: number | null
          saldo_carona_global_disponivel: number | null
          saldo_id: string | null
          saldo_interno_disponivel: number | null
        }
        Relationships: []
      }
      srp_vw_saldo_ata: {
        Row: {
          ata_fornecedor_item_id: string | null
          fornecedor: string | null
          item_descricao: string | null
          numero_ata: string | null
          saldo_atual: number | null
          total_consumido: number | null
          total_inicial: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["perfil_acesso"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      perfil_acesso:
        | "administrador"
        | "gestor"
        | "setor_requisitante"
        | "consulta"
      srp_criterio_julgamento_enum: "Menor Preço" | "Maior Desconto"
      srp_fase_enum:
        | "Planejamento"
        | "Publicação"
        | "Propostas"
        | "Julgamento"
        | "Homologação"
      srp_modalidade_enum: "Pregão" | "Concorrência"
      srp_status_proposta_enum: "Vencedora" | "Classificada" | "Desclassificada"
      srp_tipo_cota_enum: "Ampla" | "Exclusiva ME/EPP" | "Reservada"
      srp_tipo_execucao_enum: "Participante" | "Não-Participante/Carona"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      perfil_acesso: [
        "administrador",
        "gestor",
        "setor_requisitante",
        "consulta",
      ],
      srp_criterio_julgamento_enum: ["Menor Preço", "Maior Desconto"],
      srp_fase_enum: [
        "Planejamento",
        "Publicação",
        "Propostas",
        "Julgamento",
        "Homologação",
      ],
      srp_modalidade_enum: ["Pregão", "Concorrência"],
      srp_status_proposta_enum: [
        "Vencedora",
        "Classificada",
        "Desclassificada",
      ],
      srp_tipo_cota_enum: ["Ampla", "Exclusiva ME/EPP", "Reservada"],
      srp_tipo_execucao_enum: ["Participante", "Não-Participante/Carona"],
    },
  },
} as const
