
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
export function formatCodigoPCA(randomPart: string, ano: number = new Date().getFullYear()): string {
  return `PCA-${randomPart}-${ano}`;
}

export async function generateUniqueCodigo(): Promise<string> {
  let randomPart = "";
  let fullCodigo = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    randomPart = generateRandomCode();
    fullCodigo = formatCodigoPCA(randomPart);
    console.log(`Tentativa ${attempts + 1}: Verificando código ${fullCodigo}`);
    
    // Verifica se já existe
    const { data, error } = await (supabase as any)
      .from("contratacoes")
      .select("id")
      .eq("codigo", fullCodigo)
      .maybeSingle();

    if (error) {
        console.error("Erro ao verificar unicidade do código:", error);
        return fullCodigo; 
    }

    if (!data) {
      console.log("Código único encontrado!");
      isUnique = true;
    } else {
      console.log("Código já existe, tentando novamente...");
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Não foi possível gerar um código único após várias tentativas.");
  }

  return fullCodigo;
}
