
import jsPDF from "jspdf";
import type { Passenger } from "@/components/BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { PDF_CONFIG } from "./pdfConfig";
import { getExcursionInfoLine, formatStops, splitTextIntoLines } from "./pdfHelpers";
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
  
  // Header section with logo and association name - improved layout
  let headerHeight = 25; // Reserve more space for header
  
  if (logoDataURL) {
    try {
      // Logo positioned at top-left
      doc.addImage(logoDataURL, "PNG", x + 5, y + 5, 20, 20);
    } catch (error) {
      console.log("Error al añadir logo al PDF");
    }
  }
  
  // Association name - full name next to logo
  if (association?.name) {
    doc.setFontSize(FONTS.TITLE);
    doc.setTextColor(...COLORS.BLACK);
    const nameLines = splitTextIntoLines(association.name, 25);
    let nameY = y + 10;
    nameLines.forEach((line, index) => {
      doc.text(line, x + 30, nameY + (index * 6));
    });
    // Adjust header height based on name lines
    headerHeight = Math.max(25, 15 + (nameLines.length * 6));
  }
  
  // Title "RECIBO EXCURSIÓN" - positioned at top right
  doc.setFontSize(FONTS.MEDIUM);
  doc.setTextColor(...COLORS.DARK_GRAY);
  doc.text("RECIBO EXCURSIÓN", x + MAIN_RECEIPT_WIDTH - 5, y + 10, { align: "right" });
  
  // Contact information - moved down below association name
  let currentY = y + headerHeight;
  doc.setFontSize(FONTS.SMALL);
  doc.setTextColor(...COLORS.DARK_GRAY);
  
  if (association?.address) {
    doc.text(association.address, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
    currentY += 6;
  }
  
  if (association?.phone) {
    doc.text(`Tel: ${association.phone}`, x + 5, currentY);
    currentY += 6;
  }
  
  // Receipt number - moved down
  doc.setFontSize(FONTS.LARGE);
  doc.setTextColor(...COLORS.BLACK);
  doc.text(`Recibo N°: ${receiptNumber}`, x + 5, currentY);
  currentY += 10;
  
  // Excursion information - starts lower to give more space to header
  doc.setFontSize(FONTS.TITLE);
  doc.setTextColor(...COLORS.TEXT_GRAY);
  
  if (excursionInfo?.name) {
    doc.text(`Excursión: ${excursionInfo.name}`, x + 5, currentY);
    currentY += 8;
  }
  
  doc.text(`Asiento: ${seatNum}`, x + 5, currentY);
  currentY += 8;
  
  // Passenger field WITHOUT BOX - WITH LINE
  doc.setFontSize(FONTS.XLARGE);
  if (passenger) {
    doc.text(`Pasajero: ${passenger.name} ${passenger.surname}`, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
    currentY += 8;
    // Phone number in main receipt
    if (passenger.phone) {
      doc.setFontSize(FONTS.LARGE);
      doc.text(`Teléfono: ${passenger.phone}`, x + 5, currentY);
      currentY += 8;
    }
  } else {
    doc.text(`Pasajero:`, x + 5, currentY);
    // HORIZONTAL LINE instead of box
    doc.setDrawColor(...COLORS.FIELD_GRAY);
    doc.line(x + 35, currentY - 1, x + 120, currentY - 1);
    currentY += 8;
    // Phone field with line
    doc.setFontSize(FONTS.LARGE);
    doc.text(`Teléfono:`, x + 5, currentY);
    doc.line(x + 25, currentY - 1, x + 120, currentY - 1);
    currentY += 8;
  }
  
  if (excursionInfo) {
    const dateTime = getExcursionInfoLine(excursionInfo);
    if (dateTime) {
      doc.text(`Fecha/Hora: ${dateTime}`, x + 5, currentY);
      currentY += 8;
    }
    
    if (excursionInfo.place) {
      doc.text(`Salida: ${excursionInfo.place}`, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
      currentY += 8;
    }
    
    // Improved additional stops - only if they exist
    const stops = formatStops(excursionInfo);
    if (stops) {
      doc.setFontSize(FONTS.LARGE);
      doc.text(`Paradas adicionales:`, x + 5, currentY);
      currentY += 6;
      doc.setFontSize(FONTS.MEDIUM);
      // Split stops into multiple lines if necessary
      const lines = splitTextIntoLines(stops, 45);
      lines.forEach(line => {
        doc.text(line, x + 8, currentY);
        currentY += 5;
      });
      currentY += 1; // Extra spacing after stops
    }
    
    if (excursionInfo.price) {
      doc.setFontSize(FONTS.TITLE);
      doc.text(`Precio: ${excursionInfo.price} €`, x + 5, currentY);
      currentY += 8;
    }
  }
  
  // Emission date AT THE END OF RECEIPT for maximum space
  doc.setFontSize(FONTS.LARGE);
  doc.text("Fecha emisión:", x + 5, y + RECEIPT_HEIGHT - 10);
  doc.line(x + 30, y + RECEIPT_HEIGHT - 11, x + 120, y + RECEIPT_HEIGHT - 11);
}
