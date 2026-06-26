// Edge Function: catmat-catser-search
// Proxy seguro para a API pública de dados abertos do Compras.gov.br
// Evita problemas de CORS no browser e centraliza tratamento de erros.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://dadosabertos.compras.gov.br";
const TIMEOUT_MS = 15000;

// Grupos de serviços mapeados manualmente como fallback para CATSER
// (a API de serviços usa endpoints distintos que podem variar)
const GRUPOS_SERVICO_FALLBACK = [
  { codigoGrupo: 1, nomeGrupo: "SERVIÇOS DE APOIO ADMINISTRATIVO" },
  { codigoGrupo: 2, nomeGrupo: "SERVIÇOS DE COMUNICAÇÃO" },
  { codigoGrupo: 3, nomeGrupo: "SERVIÇOS DE CONSTRUÇÃO E ENGENHARIA" },
  { codigoGrupo: 4, nomeGrupo: "SERVIÇOS DE CONSULTORIA E ASSESSORIA" },
  { codigoGrupo: 5, nomeGrupo: "SERVIÇOS DE INFORMÁTICA E TI" },
  { codigoGrupo: 6, nomeGrupo: "SERVIÇOS DE LIMPEZA E CONSERVAÇÃO" },
  { codigoGrupo: 7, nomeGrupo: "SERVIÇOS DE MANUTENÇÃO E REPARO" },
  { codigoGrupo: 8, nomeGrupo: "SERVIÇOS DE SEGURANÇA E VIGILÂNCIA" },
  { codigoGrupo: 9, nomeGrupo: "SERVIÇOS DE TRANSPORTE E LOGÍSTICA" },
  { codigoGrupo: 10, nomeGrupo: "SERVIÇOS GRÁFICOS E EDITORIAIS" },
  { codigoGrupo: 11, nomeGrupo: "SERVIÇOS DE SAÚDE E MEDICINA" },
  { codigoGrupo: 12, nomeGrupo: "SERVIÇOS EDUCACIONAIS E DE CAPACITAÇÃO" },
  { codigoGrupo: 13, nomeGrupo: "SERVIÇOS JURÍDICOS" },
  { codigoGrupo: 14, nomeGrupo: "SERVIÇOS DE EVENTOS E HOSPITALIDADE" },
  { codigoGrupo: 15, nomeGrupo: "SERVIÇOS AMBIENTAIS E DE SANEAMENTO" },
  { codigoGrupo: 16, nomeGrupo: "SERVIÇOS FINANCEIROS E CONTÁBEIS" },
  { codigoGrupo: 17, nomeGrupo: "SERVIÇOS DE PESQUISA E DESENVOLVIMENTO" },
  { codigoGrupo: 18, nomeGrupo: "SERVIÇOS DE ENGENHARIA E ARQUITETURA" },
  { codigoGrupo: 19, nomeGrupo: "SERVIÇOS DE TELECOMUNICAÇÕES" },
  { codigoGrupo: 20, nomeGrupo: "OUTROS SERVIÇOS" },
];

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "";
    const tipo = (url.searchParams.get("tipo") ?? "CATMAT").toUpperCase();
    const codigoGrupo = url.searchParams.get("codigoGrupo");
    const pagina = url.searchParams.get("pagina") ?? "1";
    const tamanhoPagina = url.searchParams.get("tamanhoPagina") ?? "100";
    const codigoItem = url.searchParams.get("codigoItem");

    // ── ACTION: grupos ───────────────────────────────────────────────────────
    if (action === "grupos") {
      if (tipo === "CATSER") {
        // Tenta a API de serviços; se falhar, usa o fallback manual
        try {
          const apiUrl = `${BASE_URL}/modulo-servico/1_consultarGrupoServico`;
          const res = await fetchWithTimeout(apiUrl, TIMEOUT_MS);
          if (res.ok) {
            const json = await res.json();
            const grupos = (json?.resultado ?? []).map((g: any) => ({
              codigoGrupo: g.codigoGrupo ?? g.codigo,
              nomeGrupo: g.nomeGrupo ?? g.nome ?? "",
            }));
            return new Response(JSON.stringify({ grupos, fonte: "api" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } catch (_) {
          // API de serviços não disponível — usa fallback
        }
        return new Response(
          JSON.stringify({ grupos: GRUPOS_SERVICO_FALLBACK, fonte: "fallback" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // CATMAT
      const apiUrl = `${BASE_URL}/modulo-material/1_consultarGrupoMaterial`;
      const res = await fetchWithTimeout(apiUrl, TIMEOUT_MS);
      if (!res.ok) {
        throw new Error(`Erro na API do governo: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      const grupos = (json?.resultado ?? [])
        .filter((g: any) => g.statusGrupo !== false)
        .map((g: any) => ({
          codigoGrupo: g.codigoGrupo,
          nomeGrupo: g.nomeGrupo,
        }));
      return new Response(JSON.stringify({ grupos, fonte: "api" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: itens ────────────────────────────────────────────────────────
    if (action === "itens") {
      if (!codigoGrupo) {
        return new Response(
          JSON.stringify({ error: "Parâmetro codigoGrupo obrigatório." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      let apiUrl: string;
      if (tipo === "CATSER") {
        // Tenta endpoint de itens de serviço
        apiUrl = `${BASE_URL}/modulo-servico/4_consultarItemServico?codigoGrupo=${codigoGrupo}&pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`;
      } else {
        apiUrl = `${BASE_URL}/modulo-material/4_consultarItemMaterial?codigoGrupo=${codigoGrupo}&pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`;
      }

      const res = await fetchWithTimeout(apiUrl, TIMEOUT_MS);
      if (!res.ok) {
        throw new Error(`Erro na API do governo: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();

      const itens = (json?.resultado ?? []).map((item: any) => ({
        codigoItem: item.codigoItem ?? item.codigo,
        descricaoItem: item.descricaoItem ?? item.descricao ?? "",
        codigoGrupo: item.codigoGrupo ?? codigoGrupo,
        nomeGrupo: item.nomeGrupo ?? "",
        codigoClasse: item.codigoClasse ?? null,
        nomeClasse: item.nomeClasse ?? "",
        codigoPdm: item.codigoPdm ?? null,
        nomePdm: item.nomePdm ?? "",
        statusItem: item.statusItem ?? true,
        tipo,
      }));

      return new Response(
        JSON.stringify({
          itens,
          totalRegistros: json?.totalRegistros ?? itens.length,
          totalPaginas: json?.totalPaginas ?? 1,
          paginaAtual: Number(pagina),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── ACTION: item (busca por código exato) ────────────────────────────────
    if (action === "item") {
      if (!codigoItem) {
        return new Response(
          JSON.stringify({ error: "Parâmetro codigoItem obrigatório." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      let apiUrl: string;
      if (tipo === "CATSER") {
        apiUrl = `${BASE_URL}/modulo-servico/4_consultarItemServico?codigoItem=${codigoItem}`;
      } else {
        apiUrl = `${BASE_URL}/modulo-material/4_consultarItemMaterial?codigoItem=${codigoItem}`;
      }

      const res = await fetchWithTimeout(apiUrl, TIMEOUT_MS);
      if (!res.ok) {
        throw new Error(`Erro na API do governo: ${res.status}`);
      }
      const json = await res.json();
      const raw = json?.resultado?.[0];
      if (!raw) {
        return new Response(JSON.stringify({ item: null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({
          item: {
            codigoItem: raw.codigoItem,
            descricaoItem: raw.descricaoItem,
            codigoGrupo: raw.codigoGrupo,
            nomeGrupo: raw.nomeGrupo,
            codigoClasse: raw.codigoClasse,
            nomeClasse: raw.nomeClasse,
            codigoPdm: raw.codigoPdm,
            nomePdm: raw.nomePdm,
            tipo,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: `Ação desconhecida: '${action}'. Use: grupos | itens | item` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("[catmat-catser-search] erro:", e?.message || String(e));
    return new Response(
      JSON.stringify({
        error: e?.message || "Erro interno na Edge Function.",
        detalhe: "Falha ao consultar a API oficial do governo. Tente novamente.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
