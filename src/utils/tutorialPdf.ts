import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getTutorialSections, TOC, type PdfBlock } from "./tutorialPdfData";

// Sidebar red: hsl(349, 67%, 55%) => #D9415D
const RED: [number, number, number] = [217, 65, 93];
const GRAY_TEXT: [number, number, number] = [80, 80, 80];
const BLACK: [number, number, number] = [0, 0, 0];
const GREEN: [number, number, number] = [34, 139, 34];
const AMBER: [number, number, number] = [180, 130, 0];
const NOTE_BG: [number, number, number] = [255, 240, 240];
const NOTE_BORDER: [number, number, number] = [217, 65, 93];
const TIP_BG: [number, number, number] = [240, 255, 240];
const TIP_BORDER: [number, number, number] = [34, 139, 34];

const PAGE_W = 210;
const PAGE_H = 297;
const ML = 20;
const MR = 20;
const CW = PAGE_W - ML - MR;
const HEADER_Y = 18;
const CONTENT_Y = 32;
const FOOTER_Y = PAGE_H - 15;
const MAX_Y = FOOTER_Y - 10;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function addHeaderFooter(doc: jsPDF, logo: HTMLImageElement | null, page: number, total: number) {
  if (logo) {
    const h = 12;
    const w = (logo.width / logo.height) * h;
    doc.addImage(logo, "PNG", ML, 5, w, h);
  }
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.line(ML, HEADER_Y + 4, PAGE_W - MR, HEADER_Y + 4);
  doc.line(ML, FOOTER_Y - 3, PAGE_W - MR, FOOTER_Y - 3);
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_TEXT);
  doc.setFontSize(6);
  doc.text("Tutorial do Sistema de Gerenciamento do Plano de Contratações Anual", ML, FOOTER_Y + 2);
  doc.setFontSize(8);
  doc.text(`${page} / ${total}`, PAGE_W - MR, FOOTER_Y + 2, { align: "right" });
}

/** Ensure y doesn't overflow; returns new y after potential page break */
function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > MAX_Y) {
    doc.addPage();
    return CONTENT_Y;
  }
  return y;
}

/** Draw a justified line of text by distributing extra space between words */
function drawJustifiedLine(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, isLastLine: boolean = false) {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1 || isLastLine) {
    // Single word or last line: left-align
    doc.text(text.trim(), x, y);
    return;
  }
  
  const textWithoutSpaces = words.join("");
  const textWidth = doc.getTextWidth(textWithoutSpaces);
  const totalSpaceWidth = maxWidth - textWidth;
  const spaceCount = words.length - 1;
  const spaceWidth = totalSpaceWidth / spaceCount;
  
  let currentX = x;
  for (let i = 0; i < words.length; i++) {
    doc.text(words[i], currentX, y);
    currentX += doc.getTextWidth(words[i]) + spaceWidth;
  }
}

function renderBlock(doc: jsPDF, block: PdfBlock, y: number): number {
  switch (block.type) {
    case "h3": {
      y = checkPage(doc, y, 10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...RED);
      doc.text(block.text, ML, y);
      y += 6;
      doc.setTextColor(...BLACK);
      return y;
    }
    case "p": {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...BLACK);
      const lines: string[] = doc.splitTextToSize(block.text, CW);
      for (const line of lines) {
        y = checkPage(doc, y, 5);
        doc.text(line, ML, y, { align: "justify", maxWidth: CW });
        y += 4.5;
      }
      y += 2;
      return y;
    }
    case "ul":
    case "ol": {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...BLACK);
      const indent = ML + 5;
      const itemW = CW - 5;
      block.items.forEach((item, idx) => {
        const bullet = block.type === "ul" ? "•" : `${idx + 1}.`;
        const parts = item.split(":"); 
        // Bold the part before the first colon if exists
        let fullText = item;
        const lines: string[] = doc.splitTextToSize(`${bullet}  ${fullText}`, itemW);
        for (let li = 0; li < lines.length; li++) {
          y = checkPage(doc, y, 5);
          // For the first line, try to bold the label part
          if (li === 0 && parts.length > 1) {
            const labelEnd = `${bullet}  ${parts[0]}:`.length;
            const fullLine = lines[0];
            // Draw bullet + bold part
            const boldPart = `${bullet}  ${parts[0]}:`;
            const restPart = fullLine.substring(boldPart.length);
            doc.setFont("helvetica", "bold");
            doc.text(boldPart, indent, y);
            const boldW = doc.getTextWidth(boldPart);
            doc.setFont("helvetica", "normal");
            doc.text(restPart, indent + boldW, y);
          } else {
            doc.setFont("helvetica", "normal");
            doc.text(lines[li], indent, y);
          }
          y += 4.5;
        }
        y += 1;
      });
      y += 1.5;
      return y;
    }
    case "note": {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const noteLines: string[] = doc.splitTextToSize(block.text, CW - 10);
      const boxH = noteLines.length * 4.5 + 10;
      y = checkPage(doc, y, boxH + 2);
      // Background
      doc.setFillColor(...NOTE_BG);
      doc.roundedRect(ML, y - 3, CW, boxH, 1, 1, "F");
      // Left border
      doc.setDrawColor(...NOTE_BORDER);
      doc.setLineWidth(1.2);
      doc.line(ML, y - 3, ML, y - 3 + boxH);
      // Icon text - using text instead of emoji
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...RED);
      doc.text("[!] Importante:", ML + 4, y + 1);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      // Text content below label
      for (let i = 0; i < noteLines.length; i++) {
        doc.text(noteLines[i], ML + 4, y + 6 + i * 4.5, { align: "justify", maxWidth: CW - 12 });
      }
      y += boxH + 4;
      return y;
    }
    case "tip": {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const tipLines: string[] = doc.splitTextToSize(block.text, CW - 10);
      const boxH = tipLines.length * 4.5 + 10;
      y = checkPage(doc, y, boxH + 2);
      doc.setFillColor(...TIP_BG);
      doc.roundedRect(ML, y - 3, CW, boxH, 1, 1, "F");
      doc.setDrawColor(...TIP_BORDER);
      doc.setLineWidth(1.2);
      doc.line(ML, y - 3, ML, y - 3 + boxH);
      // Using text instead of emoji
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GREEN);
      doc.text("[*] Dica:", ML + 4, y + 1);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      // Text content below label
      for (let i = 0; i < tipLines.length; i++) {
        doc.text(tipLines[i], ML + 4, y + 6 + i * 4.5, { align: "justify", maxWidth: CW - 12 });
      }
      y += boxH + 4;
      return y;
    }
    case "table": {
      y = checkPage(doc, y, 20);
      autoTable(doc, {
        startY: y,
        head: [block.headers],
        body: block.rows,
        margin: { left: ML, right: MR },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
          textColor: BLACK,
        },
        headStyles: {
          fillColor: RED,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: block.headerAlign
          ? block.headerAlign.reduce((acc: Record<number, any>, align: string, i: number) => {
              if (i > 0) acc[i] = { halign: align };
              return acc;
            }, {})
          : {},
        didParseCell: (data: any) => {
          // Bold first column
          if (data.section === "body" && data.column.index === 0) {
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
      y = (doc as any).lastAutoTable.finalY + 6;
      return y;
    }
    default:
      return y;
  }
}

export async function generateTutorialPdf() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const logo = await loadImage("/logo-mppi.png");
  const sections = getTutorialSections();

  // ===== COVER PAGE =====
  if (logo) {
    const h = 30;
    const w = (logo.width / logo.height) * h;
    doc.addImage(logo, "PNG", (PAGE_W - w) / 2, 40, w, h);
  }
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.8);
  doc.line(ML, 80, PAGE_W - MR, 80);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BLACK);
  doc.text("Tutorial Completo do Sistema", PAGE_W / 2, 95, { align: "center" });
  doc.text("PCA 2026", PAGE_W / 2, 107, { align: "center" });
  doc.setFontSize(12);
  doc.setTextColor(...GRAY_TEXT);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gerenciamento do Plano de Contratações Anual", PAGE_W / 2, 122, { align: "center" });
  doc.text("Ministério Público do Estado do Piauí", PAGE_W / 2, 130, { align: "center" });
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.8);
  doc.line(ML, 140, PAGE_W - MR, 140);

  // ===== TABLE OF CONTENTS PAGE =====
  doc.addPage();
  const tocPageNum = doc.getNumberOfPages();
  let y = CONTENT_Y;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...RED);
  doc.text("Sumário", ML, y);
  y += 3;
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 8;

  // Store TOC item positions for linking later
  const tocItemPositions: { x: number; y: number; w: number; h: number; idx: number }[] = [];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  TOC.forEach((item, i) => {
    y = checkPage(doc, y, 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...RED);
    doc.text(`${i + 1}.`, ML, y);
    doc.setTextColor(...BLACK);
    const fullText = item;
    doc.text(fullText, ML + 8, y);
    const textW = doc.getTextWidth(`${i + 1}. ${fullText}`);
    // Save position for internal link
    tocItemPositions.push({ x: ML, y: y - 4, w: textW + 8, h: 5, idx: i });
    y += 6;
  });

  // ===== CONTENT SECTIONS (each starts on new page) =====
  const sectionPageNumbers: number[] = [];
  for (const section of sections) {
    doc.addPage();
    sectionPageNumbers.push(doc.getNumberOfPages());
    y = CONTENT_Y;

    // Section title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...RED);
    doc.text(section.title, ML, y);
    y += 3;
    doc.setDrawColor(...RED);
    doc.setLineWidth(0.3);
    doc.line(ML, y, PAGE_W - MR, y);
    y += 8;

    // Render all blocks
    for (let blockIdx = 0; blockIdx < section.content.length; blockIdx++) {
      const block = section.content[blockIdx];
      
      // Special case: "3.5. Matriz de Acesso por Funcionalidade" - force new page before the table
      if (block.type === "h3" && block.text === "3.5. Matriz de Acesso por Funcionalidade") {
        doc.addPage();
        y = CONTENT_Y;
      }
      
      y = renderBlock(doc, block, y);
    }
  }

  // ===== Add internal links from TOC to section pages =====
  doc.setPage(tocPageNum);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const pos of tocItemPositions) {
    if (pos.idx < sectionPageNumbers.length) {
      doc.link(pos.x, pos.y, pos.w, pos.h, { pageNumber: sectionPageNumbers[pos.idx] });
      // Add page number on the right
      doc.setTextColor(...GRAY_TEXT);
      doc.text(`${sectionPageNumbers[pos.idx]}`, PAGE_W - MR, pos.y + 4, { align: "right" });
      // Dotted leader line
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.1);
      const textEndX = pos.x + pos.w + 2;
      const pageNumX = PAGE_W - MR - doc.getTextWidth(`${sectionPageNumbers[pos.idx]}`) - 2;
      if (pageNumX > textEndX) {
        // Draw dots
        doc.setLineDashPattern([0.5, 1.5], 0);
        doc.line(textEndX, pos.y + 3, pageNumX, pos.y + 3);
        doc.setLineDashPattern([], 0);
      }
    }
  }

  // ===== Add PDF outline/bookmarks =====
  const docInternal = (doc as any).internal;
  if (typeof doc.outline !== "undefined") {
    // jsPDF 2.x+ supports outline
    TOC.forEach((item, i) => {
      if (i < sectionPageNumbers.length) {
        (doc.outline as any).add(null, `${i + 1}. ${item}`, { pageNumber: sectionPageNumbers[i] });
      }
    });
  }

  // ===== PASS 2: Headers & Footers =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i === 1) {
      // Cover: footer only
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.5);
      doc.line(ML, FOOTER_Y - 3, PAGE_W - MR, FOOTER_Y - 3);
      doc.setFontSize(6);
      doc.setTextColor(...GRAY_TEXT);
      doc.text("Tutorial do Sistema de Gerenciamento do Plano de Contratações Anual", ML, FOOTER_Y + 2);
      doc.setFontSize(8);
      doc.text(`${i} / ${totalPages}`, PAGE_W - MR, FOOTER_Y + 2, { align: "right" });
    } else {
      addHeaderFooter(doc, logo, i, totalPages);
    }
  }

  doc.save("Tutorial_PCA_MPPI_2026.pdf");
}
