import { Layout } from "@/components/Layout";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Artefatos() {
  const { id } = useParams();

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
              Gerencie os documentos e artefatos relacionados a esta contratação.
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-8 text-center shadow-sm">
          <h2 className="text-lg font-medium text-slate-700 mb-2">Página em Construção</h2>
          <p className="text-muted-foreground">
            A funcionalidade de artefatos para a contratação (ID: {id?.slice(-6).toUpperCase()}) será implementada em breve.
          </p>
        </div>
      </div>
    </Layout>
  );
}
