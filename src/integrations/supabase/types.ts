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
          created_at: string | null
          created_by: string | null
          data_conclusao: string | null
          data_devolucao_fiscal: string | null
          data_entrada_clc: string | null
          data_envio_pgea: string | null
          data_finalizacao_licitacao: string | null
          data_termino_contrato: string | null
          descricao: string
          empenho_1: string | null
          empenho_2: string | null
          empenho_3: string | null
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
          valor_licitado: number | null
          valor_unitario: number | null
        }
        Insert: {
          ajuste_orcamentario?: number | null
          alinhamento_estrategico?: boolean | null
          classe: string
          created_at?: string | null
          created_by?: string | null
          data_conclusao?: string | null
          data_devolucao_fiscal?: string | null
          data_entrada_clc?: string | null
          data_envio_pgea?: string | null
          data_finalizacao_licitacao?: string | null
          data_termino_contrato?: string | null
          descricao: string
          empenho_1?: string | null
          empenho_2?: string | null
          empenho_3?: string | null
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
          valor_licitado?: number | null
          valor_unitario?: number | null
        }
        Update: {
          ajuste_orcamentario?: number | null
          alinhamento_estrategico?: boolean | null
          classe?: string
          created_at?: string | null
          created_by?: string | null
          data_conclusao?: string | null
          data_devolucao_fiscal?: string | null
          data_entrada_clc?: string | null
          data_envio_pgea?: string | null
          data_finalizacao_licitacao?: string | null
          data_termino_contrato?: string | null
          descricao?: string
          empenho_1?: string | null
          empenho_2?: string | null
          empenho_3?: string | null
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
          valor_licitado?: number | null
          valor_unitario?: number | null
        }
        Relationships: []
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
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string | null
          email: string | null
          id: string
          nome_completo: string | null
          setor: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome_completo?: string | null
          setor?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome_completo?: string | null
          setor?: string | null
          telefone?: string | null
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
