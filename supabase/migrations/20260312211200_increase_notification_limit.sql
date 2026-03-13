-- Atualização do limite de caracteres para mensagens de notificação
ALTER TABLE public.notificacoes 
ALTER COLUMN mensagem TYPE varchar(200);
