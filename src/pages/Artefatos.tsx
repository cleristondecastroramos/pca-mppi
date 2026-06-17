import { Layout } from "@/components/Layout";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle2, FilePlus2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { DfdForm } from "@/components/DfdForm";

export default function Artefatos() {
  const { id } = useParams();
  const [isDfdOpen, setIsDfdOpen] = useState(false);
  const [dfdStatus, setDfdStatus] = useState<"pendente" | "preenchido">("pendente");

  const handleDfdSuccess = () => {
    setDfdStatus("preenchido");
    setIsDfdOpen(false);
  };

  return (
    <Layout>
      <div className="flex flex-col h-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/demandas-ativas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Artefatos da Contratação</h1>
            <p className="text-sm text-slate-500">
              Gerencie os documentos essenciais relacionados à contratação (ID: {id?.slice(-6).toUpperCase()}).
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
