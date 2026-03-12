import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIWriterProps {
  value: string;
  onUpdate: (newValue: string) => void;
  fieldName: string;
  className?: string;
}

export function AIWriter({ value, onUpdate, fieldName, className }: AIWriterProps) {
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    if (!value || value.trim().length < 5) {
      toast.error("O texto é muito curto para ser reescrito.");
      return;
    }

    setLoading(true);
    try {
      // Chamada para a Supabase Edge Function que processará a IA
      const { data, error } = await supabase.functions.invoke("ai-rewrite", {
        body: { 
          text: value,
          fieldName: fieldName,
          context: "Sistema PCA 2026 - Ministério Público do Piauí"
        },
      });

      if (error) throw error;

      if (data?.rewrittenText) {
        onUpdate(data.rewrittenText);
        toast.success(`${fieldName} otimizada com sucesso!`, {
          description: "O texto foi reescrito para ser mais profissional e objetivo.",
        });
      }
    } catch (error) {
      console.error("Erro ao reescrever texto:", error);
      toast.error("Não foi possível otimizar o texto no momento.", {
        description: "Verifique sua conexão ou tente novamente mais tarde."
      });
      
      // Fallback para demonstração caso a função não exista
      // No ambiente de desenvolvimento, podemos simular se o erro for 404
      if ((error as any).status === 404 || (error as any).message?.includes("not found")) {
        toast.info("Recurso de IA em fase de configuração.", {
          description: "Contate o administrador para ativar as chaves de API da IA."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleRewrite}
      disabled={loading || !value}
      title={`Otimizar ${fieldName} com IA`}
      className={`h-6 w-6 text-primary hover:text-primary hover:bg-primary/10 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
    </Button>
  );
}
