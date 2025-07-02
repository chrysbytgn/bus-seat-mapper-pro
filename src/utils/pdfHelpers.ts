
import type { ExcursionData } from "@/pages/Index";
import { formatFecha } from "./receiptsHelpers";

/**
 * PDF generation helper functions
 */
export function generateReceiptNumber(baseNum: number): string {
  return "REC-" + String(baseNum).padStart(3, "0");
}

export function getExcursionInfoLine(excursionInfo: ExcursionData | null): string {
  let out = "";
  if (excursionInfo?.date || excursionInfo?.time) {
    out += (excursionInfo?.date ? formatFecha(excursionInfo.date) : "");
    out += (excursionInfo?.time ? " " + excursionInfo.time : "");
  }
  if (excursionInfo?.place) {
    out += " / " + excursionInfo.place;
  }
  return out.trim();
}

export function formatStops(excursionInfo: ExcursionData | null): string {
  if (!excursionInfo?.stops || excursionInfo.stops.length === 0) return "";
  return excursionInfo.stops.join(" → ");
}

export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export function splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach((word, index) => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (testLine.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
      }
    } else {
      currentLine = testLine;
    }
    if (index === words.length - 1 && currentLine) {
      lines.push(currentLine);
    }
  });
  
  return lines;
}
