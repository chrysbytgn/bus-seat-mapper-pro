
import jsPDF from "jspdf";
import type { Passenger } from "@/components/BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { PDF_CONFIG } from "./pdfConfig";
import { getExcursionInfoLine, formatStops } from "./pdfHelpers";
import type { AssociationConfig } from "@/utils/associationConfig";

/**
 * Renders the main receipt section
 */
export function renderMainReceipt(
  doc: jsPDF,
  x: number,
  y: number,
  seatNum: number,
  passenger: Passenger | null,
  receiptNumber: string,
  excursionInfo: ExcursionData | null,
  association: AssociationConfig | null,
  logoDataURL: string | null
) {
  const { MAIN_RECEIPT_WIDTH, RECEIPT_HEIGHT, FONTS, COLORS } = PDF_CONFIG;
  
  // Header section with logo
  if (logoDataURL) {
    try {
      doc.addImage(logoDataURL, "PNG", x + 5, y + 5, 15, 15);
    } catch (error) {
      console.log("Error al añadir logo al PDF");
    }
  }
  
  // Association name
  if (association?.name) {
    doc.setFontSize(FONTS.MEDIUM);
    doc.setTextColor(...COLORS.BLACK);
    doc.text(association.name, x + 25, y + 12, { maxWidth: MAIN_RECEIPT_WIDTH - 30 });
  }
  
  // Title
  doc.setFontSize(FONTS.LARGE);
  doc.setTextColor(...COLORS.DARK_GRAY);
  doc.text("RECIBO EXCURSIÓN", x + MAIN_RECEIPT_WIDTH - 5, y + 8, { align: "right" });
  
  // Contact information
  let currentY = y + 20;
  doc.setFontSize(FONTS.SMALL);
  doc.setTextColor(...COLORS.DARK_GRAY);
  
  if (association?.address) {
    doc.text(association.address, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
    currentY += 5;
  }
  
  if (association?.phone) {
    doc.text(`Tel: ${association.phone}`, x + 5, currentY);
    currentY += 8;
  }
  
  // Receipt number
  doc.setFontSize(FONTS.LARGE);
  doc.setTextColor(...COLORS.BLACK);
  doc.text(`Recibo N°: ${receiptNumber}`, x + 5, currentY);
  currentY += 8;
  
  // Excursion information
  doc.setFontSize(FONTS.MEDIUM);
  doc.setTextColor(...COLORS.TEXT_GRAY);
  
  if (excursionInfo?.name) {
    doc.text(`Excursión: ${excursionInfo.name}`, x + 5, currentY);
    currentY += 6;
  }
  
  doc.text(`Asiento: ${seatNum}`, x + 5, currentY);
  currentY += 6;
  
  // Passenger field
  doc.setFontSize(FONTS.LARGE);
  if (passenger) {
    doc.text(`Pasajero: ${passenger.name} ${passenger.surname}`, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
    currentY += 6;
    if (passenger.phone) {
      doc.text(`Teléfono: ${passenger.phone}`, x + 5, currentY);
      currentY += 6;
    }
  } else {
    doc.text(`Pasajero:`, x + 5, currentY);
    doc.setDrawColor(...COLORS.LIGHT_GRAY);
    // Cambiar rectángulo por línea continua
    doc.line(x + 30, currentY, x + 120, currentY);
    currentY += 8;
    doc.text(`Teléfono:`, x + 5, currentY);
    // Cambiar rectángulo por línea continua
    doc.line(x + 30, currentY, x + 120, currentY);
    currentY += 8;
  }
  
  if (excursionInfo) {
    const dateTime = getExcursionInfoLine(excursionInfo);
    if (dateTime) {
      doc.text(`Fecha/Hora: ${dateTime}`, x + 5, currentY);
      currentY += 6;
    }
    
    if (excursionInfo.place) {
      doc.text(`Salida: ${excursionInfo.place}`, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
      currentY += 6;
    }
    
    const stops = formatStops(excursionInfo);
    if (stops) {
      doc.text(`Paradas: ${stops}`, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
      currentY += 6;
    }
    
    if (excursionInfo.price) {
      doc.setFontSize(FONTS.LARGE);
      doc.text(`Precio: ${excursionInfo.price} €`, x + 5, currentY);
      currentY += 6;
    }
  }
  
  // Emission date
  doc.setFontSize(FONTS.MEDIUM);
  doc.text("Fecha emisión: _______________", x + 5, y + RECEIPT_HEIGHT - 8);
}
