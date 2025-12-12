export function prefetchPage(path: string) {
  switch (path) {
    case "/auth":
      import("@/pages/Auth");
      break;
    case "/home":
      import("@/pages/Home");
      break;
    case "/visao-geral":
      import("@/pages/VisaoGeral");
      break;
    case "/contratacoes":
      import("@/pages/Contratacoes");
      break;
    case "/setores-demandantes":
      import("@/pages/SetoresDemandantes");
      break;
    case "/controle-prazos":
      import("@/pages/ControlePrazos");
      break;
    case "/prioridades-atencao":
      import("@/pages/PrioridadesAtencao");
      break;
    case "/prioridades-contratacao":
      import("@/pages/PrioridadesContratacao");
      break;
    case "/avaliacao-conformidade":
      import("@/pages/AvaliacaoConformidade");
      break;
    case "/resultados-alcancados":
      import("@/pages/ResultadosAlcancados");
      break;
    case "/relatorios":
      import("@/pages/Relatorios");
      break;
    case "/gerenciamento-usuarios":
      import("@/pages/GerenciamentoUsuarios");
      break;
    case "/minha-conta":
      import("@/pages/MinhaConta");
      break;
    case "/faq":
      import("@/pages/Faq");
      break;
    default:
      break;
  }
}
