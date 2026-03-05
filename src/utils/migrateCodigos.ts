
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueCodigo } from "./codigoPca";
import { toast } from "sonner";

export async function migrateExistingIds() {
  try {
    // Busca registros sem código
    const { data: records, error } = await supabase
      .from("contratacoes")
      .select("id")
      .is("codigo" as any, null);

    if (error) {
      console.error("Erro ao buscar registros para migração:", error);
      toast.error("Erro ao buscar registros. Verifique se a coluna 'codigo' foi criada no banco.");
      return;
    }

    if (!records || records.length === 0) {
      toast.info("Nenhum registro pendente de código.");
      return;
    }

    toast.info(`Migrando ${records.length} registros...`);
    let count = 0;

    for (const record of records) {
      const novoCodigo = await generateUniqueCodigo();
      const { error: updateError } = await supabase
        .from("contratacoes")
        .update({ codigo: novoCodigo } as any)
        .eq("id", record.id);

      if (updateError) {
        console.error(`Erro ao atualizar ID ${record.id}:`, updateError);
      } else {
        count++;
      }
    }

    toast.success(`Migração concluída! ${count} registros atualizados com novos códigos.`);
  } catch (err) {
    console.error("Erro na migração:", err);
    toast.error("Erro inesperado durante a migração.");
  }
}
