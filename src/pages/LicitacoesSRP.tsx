import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Gavel, 
  Package, 
  Wallet,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Lazy-loaded components
import SrpDashboard from "@/modules/srp/pages/Dashboard";
import SrpBiddingBoard from "@/modules/srp/pages/BiddingBoard";
import SrpLotBuilder from "@/modules/srp/pages/LotBuilder";
import SrpArpManager from "@/modules/srp/pages/ArpManager";

export default function LicitacoesSRP() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/visao-geral">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Licitações SRP</h1>
            <p className="text-muted-foreground">Gestão completa do Sistema de Registro de Preços.</p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 h-12">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm flex items-center gap-2 px-6">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="mesa" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm flex items-center gap-2 px-6">
              <Gavel className="h-4 w-4" />
              Mesa de Operações
            </TabsTrigger>
            <TabsTrigger value="lotes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm flex items-center gap-2 px-6">
              <Package className="h-4 w-4" />
              Construtor de Lotes
            </TabsTrigger>
            <TabsTrigger value="atas" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm flex items-center gap-2 px-6">
              <Wallet className="h-4 w-4" />
              Gestor de Atas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="border-none p-0 outline-none">
            <SrpDashboard />
          </TabsContent>
          <TabsContent value="mesa" className="border-none p-0 outline-none">
            <SrpBiddingBoard />
          </TabsContent>
          <TabsContent value="lotes" className="border-none p-0 outline-none">
            <SrpLotBuilder />
          </TabsContent>
          <TabsContent value="atas" className="border-none p-0 outline-none">
            <SrpArpManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
