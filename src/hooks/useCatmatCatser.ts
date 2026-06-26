import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TipoCatalogo = "CATMAT" | "CATSER";

export interface GrupoCatalogo {
  codigoGrupo: number;
  nomeGrupo: string;
}

export interface ItemCatalogo {
  codigoItem: number;
  descricaoItem: string;
  codigoGrupo: number | string;
  nomeGrupo: string;
  codigoClasse: number | null;
  nomeClasse: string;
  codigoPdm: number | null;
  nomePdm: string;
  tipo: TipoCatalogo;
}

// ─── Cache em sessionStorage ─────────────────────────────────────────────────

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

function cacheKey(tipo: TipoCatalogo, suffix: string) {
  return `catmat_cache_${tipo}_${suffix}`;
}

function cacheSet(key: string, data: unknown) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({ ts: Date.now(), data }),
    );
  } catch (_) {
    // sessionStorage pode não estar disponível (modo privado etc.)
  }
}

function cacheGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data as T;
  } catch (_) {
    return null;
  }
}

// ─── Funções de chamada à Edge Function ──────────────────────────────────────

async function invocarEdgeFunction(params: Record<string, string>) {
  const queryString = new URLSearchParams(params).toString();
  const { data, error } = await supabase.functions.invoke(
    `catmat-catser-search?${queryString}`,
    { method: "GET" },
  );
  if (error) throw error;
  if (typeof data === "string") return JSON.parse(data);
  return data;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useCatmatCatser() {
  const [tipo, setTipoState] = useState<TipoCatalogo>("CATMAT");
  const [grupos, setGrupos] = useState<GrupoCatalogo[]>([]);
  const [grupoSelecionado, setGrupoSelecionadoState] = useState<GrupoCatalogo | null>(null);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [textoBusca, setTextoBusca] = useState("");
  const [itensFiltrados, setItensFiltrados] = useState<ItemCatalogo[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingItens, setLoadingItens] = useState(false);
  const [erroGrupos, setErroGrupos] = useState<string | null>(null);
  const [erroItens, setErroItens] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Filtragem local ───────────────────────────────────────────────────────
  const filtrarLocalmente = useCallback((lista: ItemCatalogo[], texto: string) => {
    if (!texto.trim()) {
      setItensFiltrados(lista);
      return;
    }
    const q = texto.toLowerCase().trim();
    setItensFiltrados(
      lista.filter(
        (it) =>
          it.descricaoItem.toLowerCase().includes(q) ||
          String(it.codigoItem).includes(q) ||
          it.nomePdm?.toLowerCase().includes(q) ||
          it.nomeClasse?.toLowerCase().includes(q),
      ),
    );
  }, []);

  // ── Carregar grupos ───────────────────────────────────────────────────────
  const carregarGrupos = useCallback(async (tipoBusca: TipoCatalogo) => {
    const key = cacheKey(tipoBusca, "grupos");
    const cached = cacheGet<GrupoCatalogo[]>(key);
    if (cached) {
      setGrupos(cached);
      return;
    }

    setLoadingGrupos(true);
    setErroGrupos(null);
    try {
      const res = await invocarEdgeFunction({ action: "grupos", tipo: tipoBusca });
      const lista: GrupoCatalogo[] = res?.grupos ?? [];
      cacheSet(key, lista);
      setGrupos(lista);
    } catch (e: any) {
      setErroGrupos(
        e?.message?.includes("Failed to fetch")
          ? "Sem conexão com a API do governo. Verifique sua conexão e tente novamente."
          : e?.message || "Erro ao carregar grupos do catálogo.",
      );
    } finally {
      setLoadingGrupos(false);
    }
  }, []);

  // ── Carregar itens por grupo ──────────────────────────────────────────────
  const carregarItens = useCallback(
    async (tipoBusca: TipoCatalogo, grupo: GrupoCatalogo, pagina = 1) => {
      // Cancela requisição anterior se houver
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const key = cacheKey(tipoBusca, `itens_${grupo.codigoGrupo}_p${pagina}`);
      const cached = cacheGet<{ itens: ItemCatalogo[]; totalPaginas: number; totalRegistros: number }>(key);
      if (cached) {
        setItens(cached.itens);
        setTotalPaginas(cached.totalPaginas);
        setTotalRegistros(cached.totalRegistros);
        setItensFiltrados(cached.itens);
        return;
      }

      setLoadingItens(true);
      setErroItens(null);
      try {
        const res = await invocarEdgeFunction({
          action: "itens",
          tipo: tipoBusca,
          codigoGrupo: String(grupo.codigoGrupo),
          pagina: String(pagina),
          tamanhoPagina: "100",
        });

        const lista: ItemCatalogo[] = res?.itens ?? [];
        const totalP = res?.totalPaginas ?? 1;
        const totalR = res?.totalRegistros ?? lista.length;

        cacheSet(key, { itens: lista, totalPaginas: totalP, totalRegistros: totalR });
        setItens(lista);
        setTotalPaginas(totalP);
        setTotalRegistros(totalR);
        setPaginaAtual(pagina);
        filtrarLocalmente(lista, textoBusca);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErroItens(
          e?.message?.includes("Failed to fetch")
            ? "Sem conexão com a API do governo. Verifique sua conexão e tente novamente."
            : e?.message || "Erro ao carregar itens do catálogo.",
        );
      } finally {
        setLoadingItens(false);
      }
    },
    [filtrarLocalmente, textoBusca],
  );

  // ── Alterar tipo (CATMAT / CATSER) ────────────────────────────────────────
  const setTipo = useCallback(
    (novoTipo: TipoCatalogo) => {
      setTipoState(novoTipo);
      setGrupoSelecionadoState(null);
      setItens([]);
      setItensFiltrados([]);
      setTextoBusca("");
      setPaginaAtual(1);
      setTotalPaginas(1);
      setTotalRegistros(0);
      setErroItens(null);
      carregarGrupos(novoTipo);
    },
    [carregarGrupos],
  );

  // ── Selecionar grupo ──────────────────────────────────────────────────────
  const setGrupoSelecionado = useCallback(
    (grupo: GrupoCatalogo | null) => {
      setGrupoSelecionadoState(grupo);
      setItens([]);
      setItensFiltrados([]);
      setTextoBusca("");
      setPaginaAtual(1);
      setTotalPaginas(1);
      setTotalRegistros(0);
      setErroItens(null);
      if (grupo) {
        carregarItens(tipo, grupo, 1);
      }
    },
    [tipo, carregarItens],
  );

  // ── Alterar filtro de texto ───────────────────────────────────────────────
  const setBusca = useCallback(
    (texto: string) => {
      setTextoBusca(texto);
      filtrarLocalmente(itens, texto);
    },
    [itens, filtrarLocalmente],
  );

  // ── Navegar por página ────────────────────────────────────────────────────
  const irParaPagina = useCallback(
    (pagina: number) => {
      if (!grupoSelecionado) return;
      carregarItens(tipo, grupoSelecionado, pagina);
    },
    [tipo, grupoSelecionado, carregarItens],
  );

  // ── Retry em caso de erro ─────────────────────────────────────────────────
  const retryGrupos = useCallback(() => carregarGrupos(tipo), [tipo, carregarGrupos]);
  const retryItens = useCallback(() => {
    if (grupoSelecionado) carregarItens(tipo, grupoSelecionado, paginaAtual);
  }, [tipo, grupoSelecionado, paginaAtual, carregarItens]);

  return {
    // Estado
    tipo,
    grupos,
    grupoSelecionado,
    itens,
    itensFiltrados,
    textoBusca,
    paginaAtual,
    totalPaginas,
    totalRegistros,
    loadingGrupos,
    loadingItens,
    erroGrupos,
    erroItens,
    // Ações
    setTipo,
    setGrupoSelecionado,
    setBusca,
    irParaPagina,
    carregarGrupos,
    retryGrupos,
    retryItens,
  };
}
