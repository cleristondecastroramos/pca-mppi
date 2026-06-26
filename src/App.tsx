import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "@/components/theme-provider";

const Auth = lazy(() => import("./pages/Auth"));
const Home = lazy(() => import("./pages/Home"));
const Contratacoes = lazy(() => import("./pages/Contratacoes"));
const LicitacoesSRP = lazy(() => import("./pages/LicitacoesSRP"));
const NovaContratacao = lazy(() => import("./pages/NovaContratacao"));
const VisaoGeral = lazy(() => import("./pages/VisaoGeral"));
const SetoresDemandantes = lazy(() => import("./pages/SetoresDemandantes"));
const Suspensas = lazy(() => import("./pages/Suspensas"));
const ControlePrazos = lazy(() => import("./pages/ControlePrazos"));
const PrioridadesContratacao = lazy(() => import("./pages/PrioridadesContratacao"));
const PrioridadesAtencao = lazy(() => import("./pages/PrioridadesAtencao"));
const AvaliacaoConformidade = lazy(() => import("./pages/AvaliacaoConformidade"));
const ResultadosAlcancados = lazy(() => import("./pages/ResultadosAlcancados"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Artefatos = lazy(() => import("./pages/Artefatos"));
const GerenciamentoUsuarios = lazy(() => import("./pages/GerenciamentoUsuarios"));
const GerenciamentoUnidades = lazy(() => import("./pages/GerenciamentoUnidades"));
const MinhaConta = lazy(() => import("./pages/MinhaConta"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const Notificacoes = lazy(() => import("./pages/Notificacoes"));
const OrcamentoPlanejado = lazy(() => import("./pages/OrcamentoPlanejado"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SelecaoExercicio = lazy(() => import("./pages/SelecaoExercicio"));
const Planejamento2027 = lazy(() => import("./pages/Planejamento2027"));
const NovaDemanda2027 = lazy(() => import("./pages/NovaDemanda2027"));
const Tutorial2026 = lazy(() => import("./pages/Tutorial2026"));
const Tutorial2027 = lazy(() => import("./pages/Tutorial2027"));
const Faq2026 = lazy(() => import("./pages/Faq2026"));
const Faq2027 = lazy(() => import("./pages/Faq2027"));
const AcessoNegado = lazy(() => import("./pages/AcessoNegado"));

const RedirectFaq = () => {
  const ex = localStorage.getItem("pca_exercicio") || "2026";
  return <Navigate to={`/faq-${ex}`} replace />;
};

const RedirectTutorial = () => {
  const ex = localStorage.getItem("pca_exercicio") || "2026";
  return <Navigate to={`/tutorial-${ex}`} replace />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000,
      gcTime: 900000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const App = () => {
  // Global auth state listener: invalidate all queries on session change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.clear();
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        queryClient.invalidateQueries();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<div className="p-6 text-center text-sm text-muted-foreground">Carregando...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/esqueci-senha" element={<EsqueciSenha />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />
                <Route path="/selecao-exercicio" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <SelecaoExercicio />
                  </ProtectedRoute>
                } />
                <Route
                  path="/gerenciamento-unidades"
                  element={
                    <ProtectedRoute allowed={["administrador"]}>
                      <GerenciamentoUnidades />
                    </ProtectedRoute>
                  }
                />
                <Route path="/planejamento-2027" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "consulta"]}>
                    <Planejamento2027 />
                  </ProtectedRoute>
                } />
                <Route path="/nova-demanda-2027" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante"]}>
                    <NovaDemanda2027 />
                  </ProtectedRoute>
                } />
                <Route path="/home" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/pontos-atencao" element={<Navigate to="/riscos-pendencias" replace />} />
                <Route path="/riscos-pendencias" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante"]}>
                    <PrioridadesAtencao />
                  </ProtectedRoute>
                } />
                <Route path="/visao-geral" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <VisaoGeral />
                  </ProtectedRoute>
                } />
                <Route path="/setores-demandantes" element={
                  <ProtectedRoute allowed={["administrador", "gestor"]}>
                    <SetoresDemandantes />
                  </ProtectedRoute>
                } />
                <Route path="/suspensas" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Suspensas />
                  </ProtectedRoute>
                } />
                <Route path="/controle-prazos" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante"]}>
                    <ControlePrazos />
                  </ProtectedRoute>
                } />
                <Route path="/prioridades-contratacao" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante"]}>
                    <PrioridadesContratacao />
                  </ProtectedRoute>
                } />
                <Route path="/avaliacao-conformidade" element={<Navigate to="/conformidade" replace />} />
                <Route path="/conformidade" element={
                  <ProtectedRoute allowed={["administrador", "gestor"]}>
                    <AvaliacaoConformidade />
                  </ProtectedRoute>
                } />
                <Route path="/resultados-alcancados" element={
                  <ProtectedRoute allowed={["administrador", "gestor"]}>
                    <ResultadosAlcancados />
                  </ProtectedRoute>
                } />
                <Route path="/contratacoes" element={<Navigate to="/demandas-ativas" replace />} />
                <Route path="/demandas-ativas" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Contratacoes />
                  </ProtectedRoute>
                } />
                <Route path="/licitacoes-srp" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <LicitacoesSRP />
                  </ProtectedRoute>
                } />
                <Route path="/nova-contratacao" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante"]}>
                    <NovaContratacao />
                  </ProtectedRoute>
                } />
                <Route path="/relatorios" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Relatorios />
                  </ProtectedRoute>
                } />
                <Route path="/artefatos" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Artefatos />
                  </ProtectedRoute>
                } />
                <Route path="/artefatos/:id" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Artefatos />
                  </ProtectedRoute>
                } />
                <Route path="/gerenciamento-usuarios" element={
                  <ProtectedRoute allowed={["administrador"]}>
                    <GerenciamentoUsuarios />
                  </ProtectedRoute>
                } />
                <Route path="/minha-conta" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <MinhaConta />
                  </ProtectedRoute>
                } />
                <Route path="/faq" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <RedirectFaq />
                  </ProtectedRoute>
                } />
                <Route path="/faq-2026" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Faq2026 />
                  </ProtectedRoute>
                } />
                <Route path="/faq-2027" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Faq2027 />
                  </ProtectedRoute>
                } />
                <Route path="/acesso-negado" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <AcessoNegado />
                  </ProtectedRoute>
                } />

                <Route path="/notificacoes" element={
                  <ProtectedRoute allowed={["administrador"]}>
                    <Notificacoes />
                  </ProtectedRoute>
                } />
                <Route path="/orcamento-planejado" element={<Navigate to="/orcamento" replace />} />
                <Route path="/orcamento" element={
                  <ProtectedRoute allowed={["administrador"]}>
                    <OrcamentoPlanejado />
                  </ProtectedRoute>
                } />
                <Route path="/tutorial" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <RedirectTutorial />
                  </ProtectedRoute>
                } />
                <Route path="/tutorial-2026" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Tutorial2026 />
                  </ProtectedRoute>
                } />
                <Route path="/tutorial-2027" element={
                  <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
                    <Tutorial2027 />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
