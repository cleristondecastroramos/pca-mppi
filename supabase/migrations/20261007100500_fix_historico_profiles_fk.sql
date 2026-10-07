-- Corrigir a relação entre contratacoes_historico e profiles adicionando a FK necessária
-- para que o schema cache do Supabase encontre a relação corretamente.

ALTER TABLE public.contratacoes_historico
  DROP CONSTRAINT IF EXISTS contratacoes_historico_user_id_fkey;

ALTER TABLE public.contratacoes_historico
  ADD CONSTRAINT contratacoes_historico_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
