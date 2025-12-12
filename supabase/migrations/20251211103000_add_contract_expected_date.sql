-- Add expected contract date for planning and alerts
ALTER TABLE public.contratacoes
  ADD COLUMN IF NOT EXISTS data_prevista_contratacao DATE;

-- Index to accelerate date-based queries
CREATE INDEX IF NOT EXISTS idx_contratacoes_data_prevista ON public.contratacoes(data_prevista_contratacao);
