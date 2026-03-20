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
          quantidade_devolucoes: number | null
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
          tipo_recurso: string
          unidade_beneficiaria: string | null
          unidade_fornecimento: string | null
          unidade_orcamentaria: string
          updated_at: string | null
          valor_contratado: number | null
          valor_estimado: number
          valor_executado: number | null
          valor_licitado: number | null
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
          quantidade_devolucoes?: number | null
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
          tipo_recurso: string
          unidade_beneficiaria?: string | null
          unidade_fornecimento?: string | null
          unidade_orcamentaria: string
          updated_at?: string | null
          valor_contratado?: number | null
          valor_estimado: number
          valor_executado?: number | null
          valor_licitado?: number | null
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
          quantidade_devolucoes?: number | null
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
          tipo_recurso?: string
          unidade_beneficiaria?: string | null
          unidade_fornecimento?: string | null
          unidade_orcamentaria?: string
          updated_at?: string | null
          valor_contratado?: number | null
          valor_estimado?: number
          valor_executado?: number | null
          valor_licitado?: number | null
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
          updated_at?: string | null
        }
        Relationships: []
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
      [_ in never]: never
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
    },
  },
} as const
