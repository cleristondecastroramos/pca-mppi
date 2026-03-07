CREATE TABLE IF NOT EXISTS public.orcamento_planejado_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id UUID,
    setor_requisitante TEXT NOT NULL,
    ano INTEGER NOT NULL,
    valor_pgj_anterior NUMERIC,
    valor_pgj_novo NUMERIC,
    valor_fmmp_anterior NUMERIC,
    valor_fmmp_novo NUMERIC,
    valor_fepdc_anterior NUMERIC,
    valor_fepdc_novo NUMERIC,
    trava_ativa_anterior BOOLEAN,
    trava_ativa_novo BOOLEAN,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    usuario_id UUID
);

ALTER TABLE public.orcamento_planejado_auditoria ENABLE ROW LEVEL SECURITY;

-- Permite leitura de logs de auditoria
CREATE POLICY "Leitura_auditoria" ON public.orcamento_planejado_auditoria
    FOR SELECT USING (auth.role() = 'authenticated');

-- Correção: FOR INSERT usa WITH CHECK ao invés de USING
CREATE POLICY "Insercao_auditoria" ON public.orcamento_planejado_auditoria
    FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION orcamento_planejado_audit_tg_fn() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF (OLD.valor_pgj IS DISTINCT FROM NEW.valor_pgj OR
        OLD.valor_fmmp IS DISTINCT FROM NEW.valor_fmmp OR
        OLD.valor_fepdc IS DISTINCT FROM NEW.valor_fepdc OR
        OLD.trava_ativa IS DISTINCT FROM NEW.trava_ativa) THEN

        INSERT INTO public.orcamento_planejado_auditoria (
            orcamento_id, setor_requisitante, ano,
            valor_pgj_anterior, valor_pgj_novo,
            valor_fmmp_anterior, valor_fmmp_novo,
            valor_fepdc_anterior, valor_fepdc_novo,
            trava_ativa_anterior, trava_ativa_novo,
            usuario_id
        ) VALUES (
            NEW.id, NEW.setor_requisitante, NEW.ano,
            OLD.valor_pgj, NEW.valor_pgj,
            OLD.valor_fmmp, NEW.valor_fmmp,
            OLD.valor_fepdc, NEW.valor_fepdc,
            OLD.trava_ativa, NEW.trava_ativa,
            auth.uid()
        );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.orcamento_planejado_auditoria (
            orcamento_id, setor_requisitante, ano,
            valor_pgj_anterior, valor_pgj_novo,
            valor_fmmp_anterior, valor_fmmp_novo,
            valor_fepdc_anterior, valor_fepdc_novo,
            trava_ativa_anterior, trava_ativa_novo,
            usuario_id
        ) VALUES (
            NEW.id, NEW.setor_requisitante, NEW.ano,
            NULL, NEW.valor_pgj,
            NULL, NEW.valor_fmmp,
            NULL, NEW.valor_fepdc,
            NULL, NEW.trava_ativa,
            auth.uid()
        );
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_orcamento_planejado_audit ON public.orcamento_planejado;

CREATE TRIGGER trg_orcamento_planejado_audit
AFTER INSERT OR UPDATE ON public.orcamento_planejado
FOR EACH ROW
EXECUTE FUNCTION orcamento_planejado_audit_tg_fn();
