import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Removido alternador de abas e componentes de cadastro
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Removido estado de confirmação de senha (cadastro desativado)

  // Override theme colors locally for the login page to use red (#D9415D)
  const loginThemeVars = {
    ["--primary" as any]: "349 67% 55%", // #D9415D
    ["--primary-foreground" as any]: "0 0% 100%",
    ["--primary-light" as any]: "349 67% 65%",
    ["--primary-dark" as any]: "349 67% 45%",
    ["--accent" as any]: "349 67% 60%",
    ["--ring" as any]: "349 67% 55%",
  } as React.CSSProperties;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Redireciona apenas quando evento indica logged in
      if (event === "SIGNED_IN" && session) {
    navigate("/home", { replace: true });
      }
    });

    // Evita redirect imediato; deixa ProtectedRoute gerir acesso
    // Mantém usuário em /auth até sign-in explícito
    return () => subscription.unsubscribe();
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
      // Navega após sucesso para o dashboard, agora com sessão válida
    navigate("/home", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  // Removido handler de cadastro

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4"
      style={loginThemeVars}
    >
      <Card className="w-full max-w-3xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center">
          <div className="mb-2">
            <img
              src="/logo-mppi.png"
              alt="Logo oficial do MPPI"
              className="mx-auto h-12 w-auto object-contain"
            />
          </div>
          <CardTitle
            className="text-lg font-bold"
            style={{ fontFamily: 'QueensidesLight-ZVj3l, sans-serif' }}
          >
            PLANO DE CONTRATAÇÕES ANUAL - PCA 2026
          </CardTitle>
          <CardDescription>
            Sistema de Gerenciamento de Contratações - MPPI
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Lado esquerdo: imagem ilustrativa */}
            <div className="flex items-center justify-center px-6 pt-0 pb-6 bg-card md:col-span-5 md:col-start-2">
              <img
                src="/22933-removebg-preview.png"
                alt="Ilustração PCA"
                className="h-56 md:h-72 w-auto object-contain"
              />
            </div>

            {/* Lado direito: login */}
            <div className="p-6 md:col-span-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu.email@mppi.mp.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading} size="xs">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
