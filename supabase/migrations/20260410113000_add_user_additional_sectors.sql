-- Migração para permitir múltiplos setores por usuário
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS setores_adicionais TEXT[] DEFAULT '{}';

-- Comentário para documentação
COMMENT ON COLUMN public.profiles.setores_adicionais IS 'Lista de setores adicionais que o usuário tem permissão para visualizar e gerenciar demandas.';
