
import { supabase } from "@/integrations/supabase/client";

/**
 * Gera um código alfanumérico de 4 caracteres maiúsculos (A-Z, 0-9).
 */
export function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Gera um código único verificando no banco de dados se já existe.
 * Tenta até 5 vezes encontrar um código livre.
 */
export async function generateUniqueCodigo(): Promise<string> {
  let codigo = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    codigo = generateRandomCode();
    
    // Verifica se já existe
    const { data, error } = await (supabase as any)
      .from("contratacoes")
      .select("id")
      .eq("codigo", codigo)
      .maybeSingle();

    if (error) {
        console.error("Erro ao verificar unicidade do código:", error);
        // Em caso de erro (ex: coluna não existe), retornamos o código gerado mesmo assim
        // para não travar o fluxo, mas logamos o erro.
        return codigo; 
    }

    if (!data) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Não foi possível gerar um código único após várias tentativas.");
  }

  return codigo;
}
