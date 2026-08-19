-- Migration to modify contratacoes_historico to support DELETE operations properly
BEGIN;

-- 1. Remove the ON DELETE CASCADE constraint
-- In Supabase/Postgres, we need to drop the existing foreign key constraint
DO $$
DECLARE
    fk_name TEXT;
BEGIN
    SELECT constraint_name INTO fk_name
    FROM information_schema.key_column_usage
    WHERE table_name = 'contratacoes_historico' AND column_name = 'contratacao_id' AND position_in_unique_constraint IS NOT NULL
    LIMIT 1;

    IF fk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.contratacoes_historico DROP CONSTRAINT ' || fk_name;
    END IF;
END $$;

-- 2. Make contratacao_id nullable
ALTER TABLE public.contratacoes_historico ALTER COLUMN contratacao_id DROP NOT NULL;

-- 3. Add the foreign key back with ON DELETE SET NULL
ALTER TABLE public.contratacoes_historico 
ADD CONSTRAINT fk_contratacoes_historico_contratacao_id 
FOREIGN KEY (contratacao_id) REFERENCES public.contratacoes(id) ON DELETE SET NULL;

-- 4. Update the log_contratacao_audit function to handle DELETE
CREATE OR REPLACE FUNCTION public.log_contratacao_audit()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acao TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_acao := 'Criação';
    INSERT INTO public.contratacoes_historico(contratacao_id, user_id, acao, dados_anteriores, dados_novos)
    VALUES (NEW.id, auth.uid(), v_acao, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.etapa_processo IS DISTINCT FROM NEW.etapa_processo AND NEW.etapa_processo = 'Cancelada' THEN
      v_acao := 'Cancelamento';
    ELSE
      v_acao := 'Edição';
    END IF;
    INSERT INTO public.contratacoes_historico(contratacao_id, user_id, acao, dados_anteriores, dados_novos)
    VALUES (NEW.id, auth.uid(), v_acao, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_acao := 'Exclusão';
    INSERT INTO public.contratacoes_historico(contratacao_id, user_id, acao, dados_anteriores, dados_novos)
    VALUES (OLD.id, auth.uid(), v_acao, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 5. Drop and recreate the trigger on contratacoes to include DELETE
DROP TRIGGER IF EXISTS trg_contratacoes_audit ON public.contratacoes;
CREATE TRIGGER trg_contratacoes_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.contratacoes
  FOR EACH ROW EXECUTE FUNCTION public.log_contratacao_audit();

COMMIT;
