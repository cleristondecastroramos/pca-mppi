ALTER TABLE public.contratacoes
ADD COLUMN srp BOOLEAN DEFAULT FALSE;

ALTER TABLE public.contratacoes_conformidade
ADD COLUMN assinatura_contrato BOOLEAN DEFAULT FALSE,
ADD COLUMN publicacao_contrato BOOLEAN DEFAULT FALSE;

-- Atualização v1.0.52: Aumento do limite de caracteres das notificações para 200
ALTER TABLE public.notificacoes ALTER COLUMN mensagem TYPE varchar(200);
