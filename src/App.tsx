import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

const Auth = lazy(() => import("./pages/Auth"));
const Home = lazy(() => import("./pages/Home"));
const Contratacoes = lazy(() => import("./pages/Contratacoes"));
const NovaContratacao = lazy(() => import("./pages/NovaContratacao"));
const VisaoGeral = lazy(() => import("./pages/VisaoGeral"));
const SetoresDemandantes = lazy(() => import("./pages/SetoresDemandantes"));
const ControlePrazos = lazy(() => import("./pages/ControlePrazos"));
const PrioridadesContratacao = lazy(() => import("./pages/PrioridadesContratacao"));
const PrioridadesAtencao = lazy(() => import("./pages/PrioridadesAtencao"));
const AvaliacaoConformidade = lazy(() => import("./pages/AvaliacaoConformidade"));
const ResultadosAlcancados = lazy(() => import("./pages/ResultadosAlcancados"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const GerenciamentoUsuarios = lazy(() => import("./pages/GerenciamentoUsuarios"));
const MinhaConta = lazy(() => import("./pages/MinhaConta"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="p-6 text-center text-sm text-muted-foreground">Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/home" element={
            <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/prioridades-atencao" element={
            <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
              <PrioridadesAtencao />
            </ProtectedRoute>
          } />
          <Route path="/visao-geral" element={
            <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
              <VisaoGeral />
            </ProtectedRoute>
          } />
          <Route path="/setores-demandantes" element={
            <ProtectedRoute allowed={["administrador", "gestor", "consulta"]}>
              <SetoresDemandantes />
            </ProtectedRoute>
          } />
          <Route path="/controle-prazos" element={
            <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
              <ControlePrazos />
            </ProtectedRoute>
          } />
          <Route path="/prioridades-contratacao" element={
            <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
              <PrioridadesContratacao />
            </ProtectedRoute>
          } />
          <Route path="/avaliacao-conformidade" element={
            <ProtectedRoute allowed={["administrador", "gestor", "consulta"]}>
              <AvaliacaoConformidade />
            </ProtectedRoute>
          } />
          <Route path="/resultados-alcancados" element={
            <ProtectedRoute allowed={["administrador", "gestor", "consulta"]}>
              <ResultadosAlcancados />
            </ProtectedRoute>
          } />
          <Route path="/contratacoes" element={
            <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
              <Contratacoes />
            </ProtectedRoute>
          } />
          <Route path="/nova-contratacao" element={
            <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante"]}>
              <NovaContratacao />
            </ProtectedRoute>
          } />
          <Route path="/relatorios" element={
            <ProtectedRoute allowed={["administrador", "gestor", "consulta"]}>
              <Relatorios />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
