import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { translateError } from "@/lib/utils/error-translations";

import { InfiniteGrid } from "@/components/ui/the-infinite-grid";
import { ShimmerText } from "@/components/ui/shimmer-bg-text";

export default function Auth() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginThemeVars = {
    ["--primary" as any]: "349 67% 55%", // #D9415D
    ["--primary-foreground" as any]: "0 0% 100%",
    ["--primary-light" as any]: "349 67% 65%",
    ["--primary-dark" as any]: "349 67% 45%",
    ["--accent" as any]: "349 67% 60%",
    ["--ring" as any]: "349 67% 55%",
  } as React.CSSProperties;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.auth.getUser();
      if (data?.user && !error) {
        navigate("/home", { replace: true });
      } else {
        await supabase.auth.signOut();
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success("Login realizado com sucesso!");
      navigate("/home", { replace: true });
    } catch (error: any) {
      const errorMessage = translateError(error.message || "Erro ao fazer login");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 h-screen overflow-hidden" style={loginThemeVars}>
      {/* Left Section: Access and Credentials */}
      <InfiniteGrid className="p-8 md:p-16 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-1000">
          <div className="flex justify-center transition-transform hover:scale-105 duration-300">
            <img src="/logo-mppi.png" alt="MPPI" className="h-20 w-auto object-contain" />
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-gray-600 font-semibold ml-1 dark:text-gray-300">Usuário</Label>
              <Input 
                id="login-email" 
                type="email" 
                placeholder="seu.email@mppi.mp.br" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-red-50/50 border border-[#D9415D]/30 h-11 focus-visible:ring-1 focus-visible:ring-primary shadow-sm dark:bg-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-gray-600 font-semibold ml-1 dark:text-gray-300">Senha</Label>
              <Input 
                id="login-password" 
                type="password" 
                placeholder="********"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-red-50/50 border border-[#D9415D]/30 h-11 focus-visible:ring-1 focus-visible:ring-primary shadow-sm dark:bg-slate-900"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-gray-600 font-semibold ml-1 dark:text-gray-300">Tema</Label>
              <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                <SelectTrigger className="bg-red-50/50 border border-[#D9415D]/30 h-11 focus:ring-1 focus:ring-primary shadow-sm dark:bg-slate-900">
                  <SelectValue placeholder="Padrão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Padrão do Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold bg-[#D9415D] hover:bg-[#C0354E] text-white shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Acessar minha conta"}
            </Button>

            <div className="flex flex-col items-center gap-3 pt-4">
              <button type="button" className="text-sm font-semibold hover:underline text-[#D9415D] dark:text-red-400" onClick={() => navigate("/redefinir-senha")}>
                Alterar a senha? <span className="font-bold">Altere aqui</span>
              </button>
              <button type="button" className="text-sm font-semibold hover:underline text-[#D9415D] dark:text-red-400" onClick={() => navigate("/esqueci-senha")}>
                Esqueceu sua senha? <span className="font-bold">Recupere aqui</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer on left side bottom - Centered single line */}
        <div className="absolute bottom-2 left-0 right-0 px-8 text-center w-full z-20">
          <p className="text-[10px] text-gray-400 font-medium whitespace-nowrap dark:text-gray-500">
            © 2026 Sistema de Gerenciamento de Contratações - MPPI | Desenvolvido pela Assessoria de Planejamento e Gestão
          </p>
        </div>
      </InfiniteGrid>

      {/* Right Section: Visual Illustration */}
      <div className="hidden md:flex flex-col items-center justify-center bg-[#D9415D] relative overflow-hidden p-12">
        {/* Subtle decorative elements for premium feel */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl p-10" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-black/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-1000">
          <img 
            src="/22933-removebg-preview.png" 
            alt="PCA MPPI Illustration" 
            className="max-h-[45vh] w-auto object-contain filter brightness-110 mb-8 drop-shadow-2xl"
          />
          <div className="space-y-2">
            <ShimmerText 
              text="PLANO DE CONTRATAÇÕES ANUAL - PCA 2026" 
              className="text-2xl font-extrabold tracking-tight uppercase drop-shadow-md"
            />
            <p className="text-white/90 text-sm font-medium tracking-widest uppercase border-t border-white/20 pt-2">
              Sistema de Gerenciamento de Contratações - MPPI
            </p>
          </div>
        </div>
        
        {/* Light overlay for dynamic feel */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
      </div>
    </div>
  );
}
