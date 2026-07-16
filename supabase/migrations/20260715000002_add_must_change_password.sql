-- Atualização v1.0.55: Adicionar campo must_change_password para forçar alteração de senha provisória
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
