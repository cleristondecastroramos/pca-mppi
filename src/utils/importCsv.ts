import { supabase } from "@/integrations/supabase/client";

export const parseAndImportCSV = async (fileContent: string) => {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < fileContent.length; i++) {
    const char = fileContent[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim().length > 0) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim().length > 0) lines.push(currentLine);

  const headers = lines[0].split(',').map(h => h.trim());
  
  const getColIndex = (name: string) => headers.findIndex(h => h.toUpperCase() === name.toUpperCase());

  const colMap = {
    descricao: getColIndex("DESCRIÇÃO DO OBJETO"),
    classe: getColIndex("CLASSE"),
    justificativa: getColIndex("JUSTIFICATIVA"),
    unidade_orcamentaria: getColIndex("UNIDADE ORÇAMENTÁRIA"),
    setor_requisitante: getColIndex("SETOR REQUISITANTE"),
    tipo_contratacao: getColIndex("TIPO DE CONTRATAÇÃO"),
    modalidade: getColIndex("MODALIDADE DE CONTRATAÇÃO"),
    grau_prioridade: getColIndex("GRAU DE PRIORIDADE"),
    tipo_recurso: getColIndex("TIPO DE RECURSO"),
    valor_estimado: getColIndex("VALOR ESTIMADO PARA 2026"),
    data_prevista: getColIndex("TÉRMINO DO CONTRATO / PREVISÃO DE CONTRATAÇÃO"),
    quantidade_itens: getColIndex("QUANTIDADE ITENS"),
    valor_unitario: getColIndex("VALOR UNITÁRIO"),
    unidade_fornecimento: getColIndex("UNIDADE DE FORNECIMENTO"),
    numero_sei: getColIndex("N° SEI/ CONTRATAÇÃO"),
    valor_contratado: getColIndex("VALOR LICITADO / CONTRATADO"),
    empenho_1: getColIndex("EMPENHO 1"),
    empenho_2: getColIndex("EMPENHO 2"),
    empenho_3: getColIndex("EMPENHO 3"),
    data_dfd_compra: getColIndex("DATA DFD PARA COMPRA"),
    data_dfd_oficio: getColIndex("DATA DO DFD/OFÍCIO"),
    data_conclusao: getColIndex("DATA DE CONCLUSÃO"),
    data_prevista_contratacao: getColIndex("TÉRMINO DO CONTRATO / PREVISÃO DE CONTRATAÇÃO"),
    pdm_catser: getColIndex("PDM/CATSER"),
  };

  const parseCurrency = (val: string) => {
    if (!val) return 0;
    const num = parseFloat(val.replace(/[R$\s.]/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const parseDate = (val: string) => {
    if (!val) return null;
    const parts = val.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY -> YYYY-MM-DD
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return null;
  };

  const records = [];
  
  // Custom CSV line splitter to handle quotes
  const splitCSVLine = (line: string) => {
    const res = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        res.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    res.push(current.trim());
    return res;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = splitCSVLine(line);
    
    // Safety check for incomplete lines
    if (cols.length < headers.length * 0.5) continue; 

    const rawTipoContratacao = cols[colMap.tipo_contratacao]?.replace(/^"|"$/g, '') || "Nova Contratação";
    let tipoContratacao = "Nova Contratação";
    if (rawTipoContratacao.includes("Renovação")) tipoContratacao = "Renovação";
    else if (rawTipoContratacao.includes("Apostilamento")) tipoContratacao = "Aditivo Quantitativo";
    else if (rawTipoContratacao.includes("Repactuação")) tipoContratacao = "Repactuação";

    const rawModalidade = cols[colMap.modalidade]?.replace(/^"|"$/g, '').trim() || "Dispensa";
    let modalidade = "Dispensa";
    if (rawModalidade.match(/Pregão/i)) modalidade = "Pregão Eletrônico";
    else if (rawModalidade.match(/Inexigibilidade/i)) modalidade = "Inexigibilidade";
    else if (rawModalidade.match(/Concorrência/i)) modalidade = "Concorrência";
    else if (rawModalidade.match(/Dispensa/i)) modalidade = "Dispensa";

    const rawClasse = cols[colMap.classe]?.replace(/^"|"$/g, '').trim() || "Material de Consumo";
    let classe = "Material de Consumo";
    if (rawClasse.match(/Consumo/i)) classe = "Material de Consumo";
    else if (rawClasse.match(/Permanente/i)) classe = "Material Permanente";
    else if (rawClasse.match(/Serviço de TI/i)) classe = "Serviço de TI";
    else if (rawClasse.match(/Serviço/i)) classe = "Serviço"; // Ordem importa: TI checado antes
    else if (rawClasse.match(/Engenharia/i)) classe = "Engenharia";
    else if (rawClasse.match(/Obra/i)) classe = "Obra";

    let setor = cols[colMap.setor_requisitante]?.replace(/^"|"$/g, '').trim().toUpperCase() || "PLANEJAMENTO";
    if (setor === "PLAN") setor = "PLANEJAMENTO";

    const dfdCompra = cols[colMap.data_dfd_compra]?.replace(/^"|"$/g, '').trim() || "";
    const dfdOficio = cols[colMap.data_dfd_oficio]?.replace(/^"|"$/g, '').trim() || "";
    const conclusao = cols[colMap.data_conclusao]?.replace(/^"|"$/g, '').trim() || "";

    let status = "Em Licitação";
    if (conclusao) {
      status = "Concluído";
    } else if (!dfdCompra && !dfdOficio) {
      status = "Planejamento";
    }

    const record = {
      descricao: cols[colMap.descricao]?.replace(/^"|"$/g, '') || "Sem descrição",
      classe: classe,
      justificativa: cols[colMap.justificativa]?.replace(/^"|"$/g, '') || "Importado via CSV",
      unidade_orcamentaria: cols[colMap.unidade_orcamentaria]?.replace(/^"|"$/g, '') || "PGJ",
      setor_requisitante: setor,
      tipo_contratacao: tipoContratacao,
      modalidade: modalidade,
      grau_prioridade: cols[colMap.grau_prioridade]?.replace(/^"|"$/g, '') || "Média",
      tipo_recurso: cols[colMap.tipo_recurso]?.replace(/^"|"$/g, '') || "Custeio",
      valor_estimado: parseCurrency(cols[colMap.valor_estimado]?.replace(/^"|"$/g, '') || "0"),
      data_termino_contrato: parseDate(cols[colMap.data_prevista]?.replace(/^"|"$/g, '') || "") || null,
      data_prevista_contratacao: parseDate(cols[colMap.data_prevista_contratacao]?.replace(/^"|"$/g, '') || "") || null,
      quantidade_itens: parseInt(cols[colMap.quantidade_itens]?.replace(/^"|"$/g, '') || "0") || 1,
      valor_unitario: parseCurrency(cols[colMap.valor_unitario]?.replace(/^"|"$/g, '') || "0"),
      unidade_fornecimento: cols[colMap.unidade_fornecimento]?.replace(/^"|"$/g, '') || "Unidade",
      numero_sei_contratacao: cols[colMap.numero_sei]?.replace(/^"|"$/g, '') || null,
      pdm_catser: cols[colMap.pdm_catser]?.replace(/^"|"$/g, '') || null,
      valor_contratado: parseCurrency(cols[colMap.valor_contratado]?.replace(/^"|"$/g, '') || "0"),
      empenho_1: cols[colMap.empenho_1]?.replace(/^"|"$/g, '') || null,
      empenho_2: cols[colMap.empenho_2]?.replace(/^"|"$/g, '') || null,
      empenho_3: cols[colMap.empenho_3]?.replace(/^"|"$/g, '') || null,
      status_inicio: "DENTRO DO PRAZO", // Default or derived
      etapa_processo: status
    };

    records.push(record);
  }

  return records;
};

export const importContratacoes = async () => {
  try {
    const response = await fetch('/demandas2026.csv');
    if (!response.ok) throw new Error('Falha ao carregar arquivo CSV');
    const text = await response.text();
    const records = await parseAndImportCSV(text);
    
    if (records.length === 0) return { count: 0, error: "Nenhum registro encontrado" };

    const { error } = await supabase.from('contratacoes').insert(records);
    if (error) throw error;

    return { count: records.length, error: null };
  } catch (error: any) {
    console.error("Erro na importação:", error);
    return { count: 0, error: error.message };
  }
};

export const removeDuplicates = async () => {
  try {
    const { data: allRecords, error: fetchError } = await supabase
      .from('contratacoes')
      .select('*')
      .order('id', { ascending: true });

    if (fetchError) throw fetchError;
    if (!allRecords || allRecords.length === 0) return { count: 0, error: null };

    const uniqueMap = new Map();
    const duplicatesToDelete: string[] = [];

    allRecords.forEach((record: any) => {
      // Create a unique key based on critical fields
      // Normalizing strings to avoid whitespace issues
      const key = [
        record.descricao?.trim(),
        record.unidade_orcamentaria?.trim(),
        record.setor_requisitante?.trim(),
        record.valor_estimado,
        record.numero_sei_contratacao?.trim() || ''
      ].join('|');
      
      if (uniqueMap.has(key)) {
        duplicatesToDelete.push(record.id);
      } else {
        uniqueMap.set(key, record.id);
      }
    });

    if (duplicatesToDelete.length === 0) return { count: 0, error: null };

    const { error: deleteError } = await supabase
      .from('contratacoes')
      .delete()
      .in('id', duplicatesToDelete);

    if (deleteError) throw deleteError;

    return { count: duplicatesToDelete.length, error: null };
  } catch (error: any) {
    console.error("Erro ao remover duplicatas:", error);
    return { count: 0, error: error.message };
  }
};
