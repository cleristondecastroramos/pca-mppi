ALTER TABLE public.orcamento_planejado_auditoria
ADD CONSTRAINT fk_auditoria_usuario
FOREIGN KEY (usuario_id) REFERENCES public.profiles(id);
