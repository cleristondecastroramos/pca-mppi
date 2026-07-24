import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarClock, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PCA_2027_UNLOCK_LABEL } from "@/config/pca2027Lock";
import { toast } from "sonner";

export default function Pca2027Indisponivel() {
  const navigate = useNavigate();

  const handleBack = () => navigate("/selecao-exercicio");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Sessão encerrada com sucesso");
      navigate("/auth");
    } catch {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-lg bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl p-8 space-y-6 text-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-center">
          <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
            <CalendarClock className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Módulo PCA 2027 ainda indisponível
          </h1>
          <div className="h-0.5 w-16 bg-amber-500 mx-auto my-3 rounded-full" />
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            O prazo oficial para apresentação das demandas do PCA 2027 inicia
            em <span className="font-semibold text-amber-600 dark:text-amber-400">{PCA_2027_UNLOCK_LABEL}</span>.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
            Enquanto isso, o módulo permanece bloqueado para cadastro e consulta
            de demandas. Pedimos que aguarde a data de abertura para iniciar o
            planejamento do exercício.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 leading-relaxed">
            O módulo <span className="font-semibold">PCA 2026</span> continua
            disponível normalmente para acompanhamento das contratações vigentes.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button className="w-full font-semibold gap-2 shadow-sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Voltar à Seleção de Exercício
          </Button>
          <Button
            variant="outline"
            className="w-full border-slate-200 hover:bg-slate-100 hover:text-red-600 dark:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-red-400 font-semibold gap-2 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair do Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}
