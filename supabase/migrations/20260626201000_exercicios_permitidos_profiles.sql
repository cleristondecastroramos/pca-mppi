-- Migration: Adicionar coluna exercicios_permitidos à tabela public.profiles
-- Define quais exercícios (anos de PCA) cada usuário tem autorização para acessar.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS exercicios_permitidos INTEGER[] NOT NULL DEFAULT ARRAY[2026];

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.profiles.exercicios_permitidos IS 'Lista de exercícios que o usuário está autorizado a acessar (ex: {2026}, {2027}, {2026, 2027}).';
