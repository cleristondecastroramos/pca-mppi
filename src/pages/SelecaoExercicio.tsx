import { useNavigate } from "react-router-dom";
import { useExercise } from "@/hooks/useExercise";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, PlayCircle, LogOut, ArrowRight, Lock, Loader2, CalendarClock } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession, useUserProfile, useUserRoles } from "@/lib/auth";
import { ForcePasswordChange } from "@/components/ForcePasswordChange";
import { toast } from "sonner";
import { isPca2027LockedForRoles, PCA_2027_UNLOCK_LABEL } from "@/config/pca2027Lock";

export default function SelecaoExercicio() {
  const navigate = useNavigate();
  const { setExercise } = useExercise();

  // Usa o cache centralizado da sessão (sem useEffect extra para buscar userId)
  const { data: session, isLoading: isSessionLoading } = useAuthSession();
  const userId = session?.user?.id;
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(userId);
  const { data: roles } = useUserRoles(userId);

  const exerciciosPermitidos: number[] = (profile as any)?.exercicios_permitidos ?? [];
  const hasAccess2026 = exerciciosPermitidos.includes(2026);
  const pca2027Locked = isPca2027LockedForRoles(roles);
  const hasAccess2027 = exerciciosPermitidos.includes(2027) && !pca2027Locked;

  // Redireciona para /auth se não houver sessão
  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate("/auth");
    }
  }, [isSessionLoading, session, navigate]);

  // Auto-seleciona exercício se o usuário tiver acesso a apenas um
  useEffect(() => {
    if (!isProfileLoading && profile && exerciciosPermitidos.length === 1) {
      const unico = exerciciosPermitidos[0];
      setExercise(unico);
      if (unico === 2026) {
        navigate("/visao-geral", { replace: true });
      } else {
        navigate("/nova-demanda", { replace: true });
      }
    }
  }, [profile, isProfileLoading, exerciciosPermitidos, navigate, setExercise]);

  // -----------------------------------------------------------------------
  // Verificação de troca de senha obrigatória
  // (dupla: JWT user_metadata + profiles.must_change_password)
  // -----------------------------------------------------------------------
  const mustChangeFromJwt = session?.user?.user_metadata?.must_change_password === true;
  const mustChangeFromProfile = (profile as any)?.must_change_password === true;
  const mustChangePassword = mustChangeFromJwt || mustChangeFromProfile;

  if (mustChangePassword && userId) {
    return <ForcePasswordChange onSuccess={() => window.location.reload()} userId={userId} />;
  }

  // Loading: aguarda sessão e perfil
  // Não trava em !profile (pode ser null por erro) — só aguarda o loading
  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-500 dark:text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        Carregando seu perfil...
      </div>
    );
  }

  const handleSelect = (year: number) => {
    if (year === 2026 && !hasAccess2026) {
      toast.error("Módulo Restrito", {
        description: "Seu usuário não possui permissão para acessar o PCA 2026."
      });
      return;
    }
    if (year === 2027 && !hasAccess2027) {
      toast.error("Módulo Restrito", {
        description: "Seu usuário não possui permissão para acessar o PCA 2027."
      });
      return;
    }
    setExercise(year);
    if (year === 2026) {
      navigate("/visao-geral");
    } else {
      navigate("/nova-demanda");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs for premium glassmorphic feel */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse duration-10000" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse duration-10000" />

      <div className="w-full max-w-4xl space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-3">
          <div className="flex justify-center transition-transform hover:scale-105 duration-300">
            <img src="/logo-mppi.png" alt="MPPI" className="h-20 w-auto object-contain drop-shadow-md" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
            Selecione o Exercício
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto text-lg">
            Olá, <span className="font-semibold text-primary">{profile?.nome_completo || "Usuário"}</span>. Escolha o ambiente de trabalho que deseja acessar:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card PCA 2026 */}
          <Card 
            className={`group cursor-pointer border backdrop-blur-xl shadow-lg transition-all duration-500 transform ${
              hasAccess2026 
                ? "border-white/40 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 hover:shadow-2xl hover:border-primary/60 hover:-translate-y-2" 
                : "border-slate-200/30 dark:border-slate-800/30 bg-white/40 dark:bg-slate-900/40 opacity-60 cursor-not-allowed select-none"
            }`}
            onClick={() => handleSelect(2026)}
          >
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-rose-500/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
                  <PlayCircle className="h-6 w-6" />
                </div>
                {hasAccess2026 ? (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-full">
                    Em Execução
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-red-500/10 text-red-500 rounded-full flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Bloqueado
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl font-bold pt-4 text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                PCA 2026
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Gestão e acompanhamento das contratações do ano corrente. Acesso aos dashboards, conformidade, orçamentos e relatórios vigentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center text-sm font-bold text-primary gap-1 group-hover:gap-2 transition-all">
              {hasAccess2026 ? (
                <>Acessar Exercício <ArrowRight className="h-4 w-4" /></>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1"><Lock className="h-4 w-4" /> Acesso Indisponível</span>
              )}
            </CardContent>
          </Card>

          {/* Card PCA 2027 */}
          <Card 
            className={`group cursor-pointer border backdrop-blur-xl shadow-lg transition-all duration-500 transform ${
              hasAccess2027 
                ? "border-white/40 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 hover:shadow-2xl hover:border-primary/60 hover:-translate-y-2" 
                : "border-slate-200/30 dark:border-slate-800/30 bg-white/40 dark:bg-slate-900/40 opacity-60 cursor-not-allowed select-none"
            }`}
            onClick={() => handleSelect(2027)}
          >
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6" />
                </div>
                {hasAccess2027 ? (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                    Planejamento
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-red-500/10 text-red-500 rounded-full flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Bloqueado
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl font-bold pt-4 text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                PCA 2027
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Cadastro e coleta de novas demandas, vinculação ao CATMAT/CATSER e análises de contratação do exercício subsequente.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center text-sm font-bold text-primary gap-1 group-hover:gap-2 transition-all">
              {hasAccess2027 ? (
                <>Acessar Exercício <ArrowRight className="h-4 w-4" /></>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1"><Lock className="h-4 w-4" /> Acesso Indisponível</span>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 font-semibold"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair do Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}
