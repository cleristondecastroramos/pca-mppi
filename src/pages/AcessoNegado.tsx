import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AcessoNegado() {
  const navigate = useNavigate();

  const handleBackToSelect = () => {
    navigate("/selecao-exercicio");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Sessão encerrada com sucesso");
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
      // Fallback
      localStorage.clear();
      sessionStorage.clear();
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos visuais de fundo premium */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl p-8 space-y-6 text-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full">
            <ShieldAlert className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acesso Restrito</h1>
          <div className="h-0.5 w-16 bg-red-500 mx-auto my-3 rounded-full" />
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Seu perfil atual não possui autorização para acessar este módulo do sistema.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
            Caso considere necessário, entre em contato com a administração do PCA-MPPI para solicitar a liberação de acesso.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            className="w-full font-semibold gap-2 shadow-sm"
            onClick={handleBackToSelect}
          >
            <ArrowLeft className="h-4 w-4" />
            Selecionar Outro Exercício
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
