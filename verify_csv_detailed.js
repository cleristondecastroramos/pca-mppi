
const fs = require('fs');

const csvPath = 'c:/Users/cleristonramos/Documents/Trae/pca-2026/pca-mppi/public/demandas2026.csv';
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = [];
let currentLine = '';
let inQuotes = false;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
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
const colMap = {
  unidade_orcamentaria: headers.findIndex(h => h.toUpperCase() === "UNIDADE ORÇAMENTÁRIA"),
  setor_requisitante: headers.findIndex(h => h.toUpperCase() === "SETOR REQUISITANTE"),
  tipo_contratacao: headers.findIndex(h => h.toUpperCase() === "TIPO DE CONTRATAÇÃO"),
  valor_estimado: headers.findIndex(h => h.toUpperCase() === "VALOR ESTIMADO PARA 2026"),
};

const parseCurrency = (val) => {
  if (!val) return 0;
  // This matches importCsv.ts: val.replace(/[R$\s.]/g, '').replace(',', '.')
  const num = parseFloat(val.replace(/^"|"$/g, '').replace(/[R$\s.]/g, '').replace(',', '.'));
  return isNaN(num) ? 0 : num;
};

const splitCSVLine = (line) => {
  const res = [];
  let current = '';
  let inQuotes = false;
  for (let i = 1; i < line.length; i++) {
    // Basic CSV split is hard, let's use a simpler one since we know the structure
  }
  // Let's use the one from importCsv.ts
  const res2 = [];
  let curr = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQ = !inQ;
    } else if (char === ',' && !inQ) {
      res2.push(curr.trim());
      curr = '';
    } else {
      curr += char;
    }
  }
  res2.push(curr.trim());
  return res2;
};

const normalizeSector = (s) => {
  if (s === "CAA" || s === "PROCON") return "CAA/PROCON";
  if (s === "PLAN") return "PLANEJAMENTO";
  return s;
};

const sectorData = {};
let totalEstimado = 0;
let totalDemandas = 0;

for (let i = 1; i < lines.length; i++) {
  const cols = splitCSVLine(lines[i]);
  if (cols.length < headers.length * 0.5) continue;

  const rawSector = (cols[colMap.setor_requisitante] || "PLANEJAMENTO").replace(/^"|"$/g, '').trim().toUpperCase();
  const s = normalizeSector(rawSector === "PLAN" ? "PLANEJAMENTO" : rawSector);
  const uo = (cols[colMap.unidade_orcamentaria] || "PGJ").replace(/^"|"$/g, '');
  const rawTipo = (cols[colMap.tipo_contratacao] || "Nova Contratação").replace(/^"|"$/g, '');
  
  let tipoContratacao = "Nova Contratação";
  if (rawTipo.includes("Renovação")) tipoContratacao = "Renovação";
  else if (rawTipo.includes("Apostilamento")) tipoContratacao = "Aditivo Quantitativo";
  else if (rawTipo.includes("Repactuação")) tipoContratacao = "Repactuação";

  const isNew = tipoContratacao === "Nova Contratação";
  const val = parseCurrency(cols[colMap.valor_estimado] || "0");

  if (!sectorData[s]) {
    sectorData[s] = { totalQty: 0, newQty: 0, newVal: 0, renQty: 0, renVal: 0 };
  }

  sectorData[s].totalQty++;
  if (isNew) {
    sectorData[s].newQty++;
    sectorData[s].newVal += val;
  } else {
    sectorData[s].renQty++;
    sectorData[s].renVal += val;
  }
  
  totalDemandas++;
  totalEstimado += val;
}

console.log("--- RESUMO GERAL ---");
console.log(`Total Demandas: ${totalDemandas}`);
console.log(`Total Estimado: ${totalEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);

console.log("\n--- DETALHAMENTO POR SETOR (Tabela 01) ---");
const sortedSectors = Object.keys(sectorData).sort((a, b) => (sectorData[b].newVal + sectorData[b].renVal) - (sectorData[a].newVal + sectorData[a].renVal));

sortedSectors.forEach(s => {
  const d = sectorData[s];
  const totalVal = d.newVal + d.renVal;
  console.log(`${s.padEnd(20)} | Qtd: ${d.totalQty.toString().padStart(3)} | New: ${d.newQty.toString().padStart(3)} | Ren: ${d.renQty.toString().padStart(3)} | Total: ${totalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).padStart(15)}`);
});
