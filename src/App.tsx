import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Contratacoes from "./pages/Contratacoes";
import NovaContratacao from "./pages/NovaContratacao";
import VisaoGeral from "./pages/VisaoGeral";
import SetoresDemandantes from "./pages/SetoresDemandantes";
import ControlePrazos from "./pages/ControlePrazos";
import PrioridadesContratacao from "./pages/PrioridadesContratacao";
import AvaliacaoConformidade from "./pages/AvaliacaoConformidade";
import ResultadosAlcancados from "./pages/ResultadosAlcancados";
import Relatorios from "./pages/Relatorios";
import GerenciamentoUsuarios from "./pages/GerenciamentoUsuarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={
            <ProtectedRoute allowed={["administrador", "gestor", "setor_requisitante", "consulta"]}>
              <Dashboard />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
