-- Add 'Concurso' and 'Credenciamento' as valid modalidade options
BEGIN;

-- Update the modalidade CHECK constraint to include the two new options
ALTER TABLE public.contratacoes DROP CONSTRAINT IF EXISTS contratacoes_modalidade_check;
ALTER TABLE public.contratacoes ADD CONSTRAINT contratacoes_modalidade_check
  CHECK (modalidade IN (
    'Pregão Eletrônico',
    'Dispensa',
    'Inexigibilidade',
    'Concorrência',
    'Concurso',
    'Credenciamento',
    'ARP (própria)',
    'ARP (carona)',
    'Inexibilidade' -- typo support for existing data if any
  ));

COMMIT;
