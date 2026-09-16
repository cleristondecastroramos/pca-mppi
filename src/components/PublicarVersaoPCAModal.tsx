import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

interface PublicarVersaoPCAModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exercicio: number;
  proximaVersao: string;   // ex: "4.0"
  totalDemandas: number;
  valorTotal: number;
  userId: string;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function PublicarVersaoPCAModal({
  open,
  onClose,
  onSuccess,
  exercicio,
  proximaVersao,
  totalDemandas,
  valorTotal,
  userId,
}: PublicarVersaoPCAModalProps) {
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [descricao, setDescricao] = useState("");
  const [confirmacaoTexto, setConfirmacaoTexto] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const PALAVRA_CONFIRMACAO = "CONFIRMAR";
  const confirmacaoValida = confirmacaoTexto.trim().toUpperCase() === PALAVRA_CONFIRMACAO;

  const handleReset = () => {
    setEtapa(1);
    setDescricao("");
    setConfirmacaoTexto("");
    setPublicando(false);
    setConcluido(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handlePublicar = async () => {
    if (!confirmacaoValida) return;
    setPublicando(true);

    try {
      const { error } = await (supabase as any)
        .from("pca_versoes")
        .insert({
          exercicio,
          versao: proximaVersao,
          descricao: descricao.trim() || null,
          publicado_por: userId,
          total_demandas: totalDemandas,
          valor_total: valorTotal,
          ativo: true,
        });

      if (error) throw error;

      setConcluido(true);
      toast.success(`Versão ${proximaVersao} do PCA ${exercicio} publicada com sucesso!`);
      setTimeout(() => {
        handleReset();
        onSuccess();
        onClose();
      }, 2200);
    } catch (err: any) {
      toast.error("Erro ao publicar versão", { description: err.message });
      setPublicando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Publicar Nova Versão do PCA
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Restrito a administradores · Exercício {exercicio}
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de etapas */}
        <div className="flex items-center gap-2 my-1">
          <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-colors ${etapa === 1 ? "bg-primary text-white border-primary" : "bg-primary/10 text-primary border-primary/40"}`}>1</div>
          <div className={`flex-1 h-0.5 transition-colors ${etapa === 2 ? "bg-primary" : "bg-border"}`} />
          <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-colors ${etapa === 2 ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground border-border"}`}>2</div>
          <span className="text-xs text-muted-foreground ml-1">{etapa === 1 ? "Informações" : "Confirmação"}</span>
        </div>

        {/* ─── ETAPA 1 ─────────────────────────────────────── */}
        {etapa === 1 && (
          <div className="space-y-5">
            {/* Banner da versão */}
            <div className="flex items-center gap-4 rounded-xl border bg-primary/5 px-4 py-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Próxima versão</p>
                <p className="text-2xl font-extrabold text-primary leading-tight">
                  PCA {exercicio} — v{proximaVersao}
                </p>
              </div>
            </div>

            {/* Estatísticas do snapshot */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-card px-4 py-3 text-center">
                <p className="text-2xl font-extrabold text-foreground">{totalDemandas}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Demandas ativas</p>
              </div>
              <div className="rounded-lg border bg-card px-4 py-3 text-center">
                <p className="text-lg font-extrabold text-foreground leading-tight">{formatCurrency(valorTotal)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Valor total estimado</p>
              </div>
            </div>

            {/* Campo de justificativa */}
            <div className="space-y-1.5">
              <Label htmlFor="descricao-versao" className="text-sm font-semibold">
                Justificativa / Descrição da versão
              </Label>
              <Textarea
                id="descricao-versao"
                placeholder="Ex: Versão 4.0 gerada após replanejamento de julho com exclusão de 8 demandas e inclusão de 3 novos itens orçamentários..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="min-h-[90px] text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground">
                A descrição ficará visível para todos os usuários no card da versão.
              </p>
            </div>

            {/* Aviso informativo */}
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Ao publicar, um registro desta versão será salvo e o documento ficará disponível
                para download por todos os usuários. O conteúdo do PDF reflete sempre os dados
                ativos no sistema no momento da geração.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={handleClose} className="gap-1">
                <X className="h-4 w-4" /> Cancelar
              </Button>
              <Button onClick={() => setEtapa(2)} className="gap-1">
                Próximo <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── ETAPA 2 ─────────────────────────────────────── */}
        {etapa === 2 && !concluido && (
          <div className="space-y-5">
            {/* Resumo do que vai acontecer */}
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-2">
              <p className="font-bold text-sm text-primary flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                O que acontecerá após a confirmação:
              </p>
              <ul className="text-xs text-foreground space-y-1.5 pl-2">
                <li className="flex gap-2"><span className="text-primary font-bold">→</span> A <strong>Versão {proximaVersao}</strong> do PCA {exercicio} será registrada no sistema</li>
                <li className="flex gap-2"><span className="text-primary font-bold">→</span> Um novo card de documento aparecerá em <strong>/relatorios</strong> para todos os usuários</li>
                <li className="flex gap-2"><span className="text-primary font-bold">→</span> O PDF gerado refletirá as <strong>{totalDemandas} demandas ativas</strong> no valor de <strong>{formatCurrency(valorTotal)}</strong></li>
                <li className="flex gap-2"><span className="text-primary font-bold">→</span> Esta ação <strong>não pode ser desfeita</strong> automaticamente</li>
              </ul>
            </div>

            {/* Campo de confirmação textual */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-input" className="text-sm font-semibold">
                Para confirmar, digite{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-bold">
                  {PALAVRA_CONFIRMACAO}
                </code>{" "}
                abaixo:
              </Label>
              <Input
                id="confirm-input"
                value={confirmacaoTexto}
                onChange={(e) => setConfirmacaoTexto(e.target.value)}
                placeholder="CONFIRMAR"
                className={`font-mono tracking-widest text-center text-sm transition-colors ${
                  confirmacaoValida
                    ? "border-green-500 ring-1 ring-green-400 focus-visible:ring-green-400"
                    : ""
                }`}
                autoComplete="off"
                spellCheck={false}
              />
              {confirmacaoValida && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirmação válida
                </p>
              )}
            </div>

            <div className="flex justify-between gap-2 pt-1">
              <Button variant="outline" onClick={() => setEtapa(1)} disabled={publicando}>
                ← Voltar
              </Button>
              <Button
                onClick={handlePublicar}
                disabled={!confirmacaoValida || publicando}
                className="gap-2 min-w-[200px]"
              >
                {publicando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publicando v{proximaVersao}...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Publicar Versão {proximaVersao}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ─── SUCESSO ─────────────────────────────────────── */}
        {concluido && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-foreground">
                Versão {proximaVersao} publicada!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                O documento já está disponível para todos os usuários em /relatorios.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
