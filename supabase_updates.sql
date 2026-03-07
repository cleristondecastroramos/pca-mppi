ALTER TABLE public.contratacoes
ADD COLUMN srp BOOLEAN DEFAULT FALSE;

ALTER TABLE public.contratacoes_conformidade
ADD COLUMN assinatura_contrato BOOLEAN DEFAULT FALSE,
ADD COLUMN publicacao_contrato BOOLEAN DEFAULT FALSE;
