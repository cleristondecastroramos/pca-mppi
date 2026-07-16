import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InfiniteGrid } from "@/components/ui/the-infinite-grid";
interface ForcePasswordChangeProps {
  onSuccess: () => void;
  userId: string;
}

const loginThemeVars = {
  ["--primary" as any]: "349 67% 55%",
  ["--primary-foreground" as any]: "0 0% 100%",
};

export function ForcePasswordChange({ onSuccess, userId }: ForcePasswordChangeProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      // 1. Atualiza a senha na auth e remove a flag do user_metadata
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
        data: { must_change_password: false }
      });

      if (authError) throw authError;

      // 2. Remove a flag na tabela profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", userId);

      if (profileError) {
        console.warn("Erro ao atualizar tabela profiles:", profileError);
      }

      toast.success("Senha atualizada com sucesso!");
      onSuccess();
    } catch (error: any) {
      toast.error("Falha ao atualizar senha: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden" style={loginThemeVars as any}>
      <InfiniteGrid className="absolute inset-0 z-0" />
      
      <div className="z-10 w-full max-w-md p-8 bg-white dark:bg-slate-900 border shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-500 relative">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bem-vindo(a)!</h2>
          <p className="text-slate-500 text-sm">
            Como este é o seu primeiro acesso, é necessário cadastrar uma senha pessoal definitiva para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nova Senha (mín. 8 caracteres)</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              className="bg-red-50/50 border border-primary/30 h-11 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              className="bg-red-50/50 border border-primary/30 h-11 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-[#D9415D] hover:bg-[#C0354E] text-white font-bold h-11 transition-all"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Atualizando...</>
              ) : (
                "Salvar Senha e Entrar"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Button variant="ghost" className="text-slate-400 hover:text-slate-600" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sair do Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}
