-- Adiciona coluna para setor de destino nas notificações
ALTER TABLE public.notificacoes ADD COLUMN IF NOT EXISTS setor_destino VARCHAR(100);

-- Comentário para documentar que NULL ou 'TODOS' significa que a notificação é para todos os setores
COMMENT ON COLUMN public.notificacoes.setor_destino IS 'Setor de destino da notificação. NULL ou TODOS significa para todos os setores.';
