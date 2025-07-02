
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
  
  // Logo
  if (logoDataURL) {
    try {
      doc.addImage(logoDataURL, "PNG", x + 5, y + 5, 15, 15);
    } catch (error) {
      console.log("Error al añadir logo al PDF");
    }
  }
  
  // Title "RECIBO EXCURSIÓN" - smaller and more to the right
  doc.setFontSize(FONTS.MEDIUM);
  doc.setTextColor(...COLORS.DARK_GRAY);
  doc.text("RECIBO EXCURSIÓN", x + MAIN_RECEIPT_WIDTH - 5, y + 8, { align: "right" });
  
  // Association name - smaller and next to logo
  const associationName = association?.name || "Asociación";
  const words = associationName.split(' ');
  const midPoint = Math.ceil(words.length / 2);
  const firstLine = words.slice(0, midPoint).join(' ');
  const secondLine = words.slice(midPoint).join(' ');
  
  doc.setFontSize(FONTS.XLARGE); // Reduced from 12 to 10
  doc.setTextColor(...COLORS.BLACK);
  doc.text(firstLine, x + 25, y + 12);
  if (secondLine) {
    doc.text(secondLine, x + 25, y + 18);
  }
  
  // Contact information - attached to association name
  doc.setFontSize(FONTS.MEDIUM);
  doc.setTextColor(...COLORS.DARK_GRAY);
  const yContactStart = secondLine ? y + 22 : y + 16;
  
  // Address/place attached to name
  if (association?.address) {
    doc.text(association.address, x + 25, yContactStart, { maxWidth: MAIN_RECEIPT_WIDTH - 30 });
  }
  // Phone below address
  if (association?.phone) {
    doc.text(`Tel: ${association.phone}`, x + 25, yContactStart + 4);
  }
  
  // Receipt number below contact info
  doc.setFontSize(FONTS.LARGE);
  doc.setTextColor(...COLORS.BLACK);
  const yPosReceiptNum = yContactStart + (association?.phone ? 10 : 6);
  doc.text(`Recibo N°: ${receiptNumber}`, x + 25, yPosReceiptNum);
  
  // Excursion information
  doc.setFontSize(FONTS.TITLE);
  doc.setTextColor(...COLORS.TEXT_GRAY);
  let yPos = y + 40;
  
  if (excursionInfo?.name) {
    doc.text(`Excursión: ${excursionInfo.name}`, x + 5, yPos);
    yPos += 8;
  }
  
  doc.text(`Asiento: ${seatNum}`, x + 5, yPos);
  yPos += 8;
  
  // Passenger field WITHOUT BOX - WITH LINE
  doc.setFontSize(FONTS.XLARGE);
  if (passenger) {
    doc.text(`Pasajero: ${passenger.name} ${passenger.surname}`, x + 5, yPos, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
    yPos += 8;
    // Phone number in main receipt
    if (passenger.phone) {
      doc.setFontSize(FONTS.LARGE);
      doc.text(`Teléfono: ${passenger.phone}`, x + 5, yPos);
      yPos += 8;
    }
  } else {
    doc.text(`Pasajero:`, x + 5, yPos);
    // HORIZONTAL LINE instead of box
    doc.setDrawColor(...COLORS.FIELD_GRAY);
    doc.line(x + 35, yPos - 1, x + 120, yPos - 1);
    yPos += 8;
    // Phone field with line
    doc.setFontSize(FONTS.LARGE);
    doc.text(`Teléfono:`, x + 5, yPos);
    doc.line(x + 25, yPos - 1, x + 120, yPos - 1);
    yPos += 8;
  }
  
  if (excursionInfo) {
    const dateTime = getExcursionInfoLine(excursionInfo);
    if (dateTime) {
      doc.text(`Fecha/Hora: ${dateTime}`, x + 5, yPos);
      yPos += 8;
    }
    
    if (excursionInfo.place) {
      doc.text(`Salida: ${excursionInfo.place}`, x + 5, yPos, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
      yPos += 8;
    }
    
    // Improved additional stops - only if they exist
    const stops = formatStops(excursionInfo);
    if (stops) {
      doc.setFontSize(FONTS.LARGE);
      doc.text(`Paradas adicionales:`, x + 5, yPos);
      yPos += 6;
      doc.setFontSize(FONTS.MEDIUM);
      // Split stops into multiple lines if necessary
      const lines = splitTextIntoLines(stops, 45);
      lines.forEach(line => {
        doc.text(line, x + 8, yPos);
        yPos += 5;
      });
      yPos += 1; // Extra spacing after stops
    }
    
    if (excursionInfo.price) {
      doc.setFontSize(FONTS.TITLE);
      doc.text(`Precio: ${excursionInfo.price} €`, x + 5, yPos);
      yPos += 8;
    }
  }
  
  // Emission date AT THE END OF RECEIPT for maximum space
  doc.setFontSize(FONTS.LARGE);
  doc.text("Fecha emisión:", x + 5, y + RECEIPT_HEIGHT - 10);
  doc.line(x + 30, y + RECEIPT_HEIGHT - 11, x + 120, y + RECEIPT_HEIGHT - 11);
}
