import { Layout } from "@/components/Layout";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle2, FilePlus2, Search, ArrowRight, Layers, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { DfdForm } from "@/components/DfdForm";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Artefatos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDfdOpen, setIsDfdOpen] = useState(false);
  const [dfdStatus, setDfdStatus] = useState<"pendente" | "preenchido">("pendente");
  
  const [demandas, setDemandas] = useState<any[]>([]);
  const [demandaAtual, setDemandaAtual] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (id) {
      const fetchDemandaAtual = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("contratacoes")
            .select("codigo, descricao")
            .eq("id", id)
            .single();
          if (!error && data) {
            setDemandaAtual(data);
          }
        } catch (err) {
          console.error("Erro ao buscar demanda", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDemandaAtual();
    } else {
      const fetchDemandas = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("contratacoes")
            .select("id, codigo, descricao, setor_requisitante, etapa_processo")
            .order("created_at", { ascending: false });

          if (error) throw error;
          setDemandas(data || []);
        } catch (err) {
          console.error("Erro ao buscar demandas", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDemandas();
    }
  }, [id]);

  const handleDfdSuccess = () => {
    setDfdStatus("preenchido");
    setIsDfdOpen(false);
  };

  if (!id) {
    const filteredDemandas = demandas.filter(d => 
      d.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.setor_requisitante?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Layout>
        <div className="flex flex-col h-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Artefatos de Contratação</h1>
              <p className="text-sm text-slate-500">
                Selecione uma demanda para gerenciar os artefatos (DFD, ETP, TR)
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 w-full max-w-md bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar por código, descrição ou setor..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-400 text-slate-700"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-blue-200 rounded-full mb-4"></div>
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredDemandas.map(demanda => (
                  <Card key={demanda.id} className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group" onClick={() => navigate(`/artefatos/${demanda.id}`)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{demanda.codigo || "S/ COD"}</span>
                          <Badge variant="outline" className="text-[10px] font-medium bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-wider">
                            {demanda.etapa_processo || "Planejamento"}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors">{demanda.descricao || "Sem descrição"}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="w-3.5 h-3.5" />
                          <span>{demanda.setor_requisitante || "Setor não informado"}</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredDemandas.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-slate-700 mb-1">Nenhuma demanda encontrada</h3>
                    <p className="text-xs text-slate-500">Tente usar outros termos na sua busca.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-start gap-4 mb-8">
          <Link to="/artefatos" className="mt-1">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 line-clamp-2">
              {loading ? "Carregando..." : demandaAtual?.descricao || "Artefatos da Contratação"}
            </h1>
            <p className="text-sm text-slate-500">
              {demandaAtual?.codigo ? `Demanda ${demandaAtual.codigo}` : `ID: ${id?.slice(-6).toUpperCase()}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card do DFD */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              {dfdStatus === "preenchido" ? (
                <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Concluído
                </span>
              ) : (
                <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  Pendente
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">DFD</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1">
              Documento de Formalização de Demanda. Inicia o planejamento da contratação.
            </p>
            
            <Dialog open={isDfdOpen} onOpenChange={setIsDfdOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant={dfdStatus === "preenchido" ? "outline" : "default"}>
                  {dfdStatus === "preenchido" ? "Visualizar DFD" : (
                    <>
                      <FilePlus2 className="w-4 h-4 mr-2" />
                      Preencher DFD
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] p-0 overflow-hidden border-0 bg-transparent shadow-none">
                <DialogTitle className="sr-only">Preencher DFD</DialogTitle>
                <DfdForm 
                  demandaId={id || ""} 
                  onClose={() => setIsDfdOpen(false)} 
                  onSuccess={handleDfdSuccess} 
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* ETP (Futuro) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col opacity-60 grayscale cursor-not-allowed">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-200 rounded-lg text-slate-500">
                <FileText className="h-6 w-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full border border-slate-300">
                Bloqueado
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">ETP</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1">
              Estudo Técnico Preliminar. Requer a conclusão do DFD para iniciar.
            </p>
            <Button disabled className="w-full" variant="secondary">
              Em breve
            </Button>
          </div>

          {/* Termo de Referência (Futuro) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col opacity-60 grayscale cursor-not-allowed">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-200 rounded-lg text-slate-500">
                <FileText className="h-6 w-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full border border-slate-300">
                Bloqueado
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Termo de Referência</h3>
            <p className="text-sm text-slate-500 mb-6 flex-1">
              Define os parâmetros para a contratação. Requer a conclusão do ETP.
            </p>
            <Button disabled className="w-full" variant="secondary">
              Em breve
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
