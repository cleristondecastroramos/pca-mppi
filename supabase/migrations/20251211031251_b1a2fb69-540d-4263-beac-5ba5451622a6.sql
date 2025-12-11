-- 1. Renomear coluna telefone para ramal na tabela profiles
ALTER TABLE public.profiles RENAME COLUMN telefone TO ramal;

-- 2. Criar tabela dedicada para Checklist de Conformidade
CREATE TABLE public.contratacoes_conformidade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contratacao_id uuid NOT NULL REFERENCES public.contratacoes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  
  -- Itens do checklist (colunas booleanas)
  termo_referencia_aprovado boolean DEFAULT false,
  pesquisa_mercado boolean DEFAULT false,
  pareceres_juridicos boolean DEFAULT false,
  publicacao_edital boolean DEFAULT false,
  atas_certame boolean DEFAULT false,
  atos_autorizacao boolean DEFAULT false,
  documentacao_fornecedor boolean DEFAULT false,
  termo_homologacao boolean DEFAULT false,
  termo_adjudicacao boolean DEFAULT false,
  
  -- Observações
  observacao text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Apenas uma conformidade por contratação
  UNIQUE(contratacao_id)
);

-- 3. Habilitar RLS
ALTER TABLE public.contratacoes_conformidade ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
CREATE POLICY "Usuários podem visualizar conformidade" 
  ON public.contratacoes_conformidade FOR SELECT 
  USING (true);

CREATE POLICY "Gestores e admins podem inserir conformidade"
  ON public.contratacoes_conformidade FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'gestor'::perfil_acesso) OR 
    has_role(auth.uid(), 'administrador'::perfil_acesso)
  );

CREATE POLICY "Gestores e admins podem atualizar conformidade"
  ON public.contratacoes_conformidade FOR UPDATE
  USING (
    has_role(auth.uid(), 'gestor'::perfil_acesso) OR 
    has_role(auth.uid(), 'administrador'::perfil_acesso)
  );

-- 5. Trigger para updated_at
CREATE TRIGGER update_conformidade_updated_at
  BEFORE UPDATE ON public.contratacoes_conformidade
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();