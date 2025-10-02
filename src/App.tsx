import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/visao-geral" element={<VisaoGeral />} />
          <Route path="/setores-demandantes" element={<SetoresDemandantes />} />
          <Route path="/controle-prazos" element={<ControlePrazos />} />
          <Route path="/prioridades-contratacao" element={<PrioridadesContratacao />} />
          <Route path="/avaliacao-conformidade" element={<AvaliacaoConformidade />} />
          <Route path="/resultados-alcancados" element={<ResultadosAlcancados />} />
          <Route path="/contratacoes" element={<Contratacoes />} />
          <Route path="/nova-contratacao" element={<NovaContratacao />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route
            path="/gerenciamento-usuarios"
            element={
              <ProtectedRoute allowed={["administrador"]}>
                <GerenciamentoUsuarios />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
