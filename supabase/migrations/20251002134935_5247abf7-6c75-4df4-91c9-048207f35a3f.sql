-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT,
  setor TEXT,
  cargo TEXT,
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipo enum para perfis de acesso
CREATE TYPE public.perfil_acesso AS ENUM ('administrador', 'gestor', 'setor_requisitante', 'consulta');

-- Tabela de roles de usuários
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role perfil_acesso NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Função para verificar se usuário tem determinado role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role perfil_acesso)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Tabela principal de contratações
CREATE TABLE IF NOT EXISTS public.contratacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações básicas
  descricao TEXT NOT NULL,
  pdm_catser TEXT,
  classe TEXT NOT NULL CHECK (classe IN ('Material de Consumo', 'Material Permanente', 'Serviço', 'Serviço de TI', 'Engenharia', 'Obra')),
  tipo_material_servico TEXT,
  justificativa TEXT NOT NULL,
  
  -- Setor e organização
  unidade_orcamentaria TEXT NOT NULL CHECK (unidade_orcamentaria IN ('PGJ', 'FMMP', 'FEPDC')),
  setor_requisitante TEXT NOT NULL CHECK (setor_requisitante IN ('CAA', 'CCF', 'CCS', 'CLC', 'CPPT', 'CTI', 'CRH', 'CEAF', 'GAECO', 'GSI', 'CONINT', 'PLANEJAMENTO')),
  unidade_beneficiaria TEXT,
  setor_atual TEXT,
  
  -- Tipo de contratação
  tipo_contratacao TEXT NOT NULL CHECK (tipo_contratacao IN ('Nova Contratação', 'Renovação', 'Aditivo Quantitativo', 'Repactuação')),
  numero_contrato TEXT,
  modo_prestacao TEXT CHECK (modo_prestacao IN ('Continuado', 'Único', 'Recorrente')),
  
  -- Valores
  quantidade_itens INTEGER,
  valor_unitario DECIMAL(15, 2),
  valor_estimado DECIMAL(15, 2) NOT NULL,
  valor_licitado DECIMAL(15, 2),
  valor_contratado DECIMAL(15, 2),
  unidade_fornecimento TEXT,
  tipo_recurso TEXT NOT NULL CHECK (tipo_recurso IN ('Custeio', 'Investimento')),
  saldo_orcamentario DECIMAL(15, 2),
  ajuste_orcamentario DECIMAL(15, 2),
  
  -- Modalidade e normativo
  modalidade TEXT NOT NULL CHECK (modalidade IN ('Pregão Eletrônico', 'Dispensa', 'Inexigibilidade', 'Concorrência')),
  normativo TEXT CHECK (normativo IN ('Lei 8.666/1993', 'Lei 14.133/2021')),
  
  -- Datas
  data_envio_pgea DATE,
  data_devolucao_fiscal DATE,
  data_entrada_clc DATE,
  data_termino_contrato DATE,
  data_finalizacao_licitacao DATE,
  data_conclusao DATE,
  
  -- Status e prioridade
  grau_prioridade TEXT NOT NULL CHECK (grau_prioridade IN ('Alta', 'Média', 'Baixa')),
  status_inicio TEXT,
  status_conclusao TEXT,
  etapa_processo TEXT CHECK (etapa_processo IN ('Planejamento', 'Em Licitação', 'Contratado', 'Concluído')),
  sobrestado BOOLEAN DEFAULT FALSE,
  
  -- SEI e empenhos
  numero_sei_licitacao TEXT,
  numero_sei_contratacao TEXT,
  empenho_1 TEXT,
  empenho_2 TEXT,
  empenho_3 TEXT,
  
  -- Alinhamento e devoluções
  alinhamento_estrategico BOOLEAN DEFAULT FALSE,
  houve_devolucao BOOLEAN DEFAULT FALSE,
  quantidade_devolucoes INTEGER DEFAULT 0,
  motivo_devolucao TEXT,
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de alterações
CREATE TABLE IF NOT EXISTS public.contratacoes_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contratacao_id UUID NOT NULL REFERENCES public.contratacoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  acao TEXT NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em contratacoes
CREATE TRIGGER update_contratacoes_updated_at
  BEFORE UPDATE ON public.contratacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    NEW.email
  );
  
  -- Atribuir role padrão de consulta
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'consulta');
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil ao cadastrar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver todos os perfis"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies para user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Apenas administradores podem gerenciar roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies para contratacoes
ALTER TABLE public.contratacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos usuários autenticados podem visualizar contratações"
  ON public.contratacoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Setores podem criar suas próprias contratações"
  ON public.contratacoes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'setor_requisitante') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'administrador')
  );

CREATE POLICY "Setores podem atualizar suas contratações ou admins/gestores podem atualizar todas"
  ON public.contratacoes FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'administrador')
  );

CREATE POLICY "Apenas administradores podem excluir contratações"
  ON public.contratacoes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies para historico
ALTER TABLE public.contratacoes_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver histórico"
  ON public.contratacoes_historico FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema pode inserir histórico"
  ON public.contratacoes_historico FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_contratacoes_setor ON public.contratacoes(setor_requisitante);
CREATE INDEX idx_contratacoes_classe ON public.contratacoes(classe);
CREATE INDEX idx_contratacoes_status ON public.contratacoes(etapa_processo);
CREATE INDEX idx_contratacoes_prioridade ON public.contratacoes(grau_prioridade);
CREATE INDEX idx_contratacoes_created_by ON public.contratacoes(created_by);
CREATE INDEX idx_historico_contratacao ON public.contratacoes_historico(contratacao_id);
