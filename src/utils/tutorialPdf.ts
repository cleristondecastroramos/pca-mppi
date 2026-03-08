import jsPDF from "jspdf";
import "jspdf-autotable";
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
  doc.text("PCA MPPI", ML, FOOTER_Y + 2);
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
        doc.text(line, ML, y);
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
      const boxH = noteLines.length * 4.5 + 6;
      y = checkPage(doc, y, boxH + 2);
      // Background
      doc.setFillColor(...NOTE_BG);
      doc.roundedRect(ML, y - 3, CW, boxH, 1, 1, "F");
      // Left border
      doc.setDrawColor(...NOTE_BORDER);
      doc.setLineWidth(1.2);
      doc.line(ML, y - 3, ML, y - 3 + boxH);
      // Icon text
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...RED);
      doc.text("⚠ Importante:", ML + 4, y + 1);
      const labelW = doc.getTextWidth("⚠ Importante: ");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      // First line continuation
      if (noteLines.length > 0) {
        const firstLineRest = noteLines[0];
        doc.text(firstLineRest, ML + 4, y + 5.5);
      }
      for (let i = 1; i < noteLines.length; i++) {
        doc.text(noteLines[i], ML + 4, y + 5.5 + i * 4.5);
      }
      y += boxH + 4;
      return y;
    }
    case "tip": {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const tipLines: string[] = doc.splitTextToSize(block.text, CW - 10);
      const boxH = tipLines.length * 4.5 + 6;
      y = checkPage(doc, y, boxH + 2);
      doc.setFillColor(...TIP_BG);
      doc.roundedRect(ML, y - 3, CW, boxH, 1, 1, "F");
      doc.setDrawColor(...TIP_BORDER);
      doc.setLineWidth(1.2);
      doc.line(ML, y - 3, ML, y - 3 + boxH);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GREEN);
      doc.text("💡 Dica:", ML + 4, y + 1);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      if (tipLines.length > 0) {
        doc.text(tipLines[0], ML + 4, y + 5.5);
      }
      for (let i = 1; i < tipLines.length; i++) {
        doc.text(tipLines[i], ML + 4, y + 5.5 + i * 4.5);
      }
      y += boxH + 4;
      return y;
    }
    case "table": {
      y = checkPage(doc, y, 20);
      const tableDoc = doc as any;
      tableDoc.autoTable({
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
      y = tableDoc.lastAutoTable.finalY + 6;
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

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  TOC.forEach((item, i) => {
    y = checkPage(doc, y, 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...RED);
    doc.text(`${i + 1}.`, ML, y);
    doc.setTextColor(...BLACK);
    doc.text(item, ML + 8, y);
    y += 6;
  });

  // ===== CONTENT SECTIONS (each starts on new page) =====
  for (const section of sections) {
    doc.addPage();
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
    for (const block of section.content) {
      y = renderBlock(doc, block, y);
    }
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
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_TEXT);
      doc.text("PCA MPPI", ML, FOOTER_Y + 2);
      doc.text(`${i} / ${totalPages}`, PAGE_W - MR, FOOTER_Y + 2, { align: "right" });
    } else {
      addHeaderFooter(doc, logo, i, totalPages);
    }
  }

  doc.save("Tutorial_PCA_MPPI_2026.pdf");
}
