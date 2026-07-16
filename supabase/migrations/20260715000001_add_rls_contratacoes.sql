-- Este script aplica RLS (Row Level Security) na tabela contratacoes 
-- para garantir que demandantes vejam apenas as demandas de sua própria unidade no backend.
-- AVISO: Teste isso cuidadosamente, pois pode impactar outras páginas caso elas dependam de ler dados globais sem usar uma role de admin/gestor/consulta.

ALTER TABLE public.contratacoes ENABLE ROW LEVEL SECURITY;

-- Política para Administradores, Gestores e Consulta (podem ver tudo)
CREATE POLICY "Permitir leitura total para admins, gestores e consulta" 
ON public.contratacoes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('administrador', 'gestor', 'consulta')
  )
);

-- Política para Demandantes (só veem sua unidade)
CREATE POLICY "Permitir leitura apenas da própria unidade para demandantes" 
ON public.contratacoes FOR SELECT 
USING (
  unidade_requisitante_id IN (
    SELECT unidade_requisitante_id FROM public.profiles WHERE profiles.id = auth.uid()
  )
);
