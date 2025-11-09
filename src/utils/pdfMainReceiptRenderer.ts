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
  
  // Header with logo and association name inline, preventing overlap
  const logoSize = 15;
  let addedLogo = false;
  let nameX = x + 5; // default if no logo
  const headerTop = y + 5;

  if (logoDataURL) {
    try {
      doc.addImage(logoDataURL, "PNG", x + 5, headerTop, logoSize, logoSize);
      addedLogo = true;
      nameX = x + 5 + logoSize + 5; // space to the right of the logo
    } catch (error) {
      console.log("Error al añadir logo al PDF");
    }
  }
  
  // Prepare association name lines to fit the remaining width
  let nameLines: string[] = [];
  if (association?.name) {
    const availableWidth = MAIN_RECEIPT_WIDTH - (nameX - x) - 5;
    nameLines = doc.splitTextToSize(association.name, availableWidth) as unknown as string[];
    doc.setFontSize(FONTS.MEDIUM);
    doc.setTextColor(...COLORS.BLACK);
    if (nameLines.length > 0) {
      doc.text(nameLines, nameX, headerTop + 7, { lineHeightFactor: 1.2 });
    }
  }
  
  // Title at top-right
  doc.setFontSize(FONTS.LARGE);
  doc.setTextColor(...COLORS.DARK_GRAY);
  doc.text("RECIBO EXCURSIÓN", x + MAIN_RECEIPT_WIDTH - 5, y + 8, { align: "right" });
  
  // Compute header height to avoid overlapping following content
  const nameBlockHeight = (nameLines.length > 0 ? nameLines.length : (association?.name ? 1 : 0)) * 4; // approx line height in mm
  const headerHeight = Math.max(addedLogo ? logoSize : 0, nameBlockHeight);
  
  // Contact information starts after header
  let currentY = headerTop + headerHeight + 6;
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
  doc.setTextColor(...COLORS.BLACK);
  
  if (passenger) {
    // Pasajero registrado - mostrar nombre directo
    doc.text(`Pasajero: ${passenger.name} ${passenger.surname}`, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
    currentY += 6;
  } else {
    // Sin pasajero - mostrar línea para escribir
    doc.text(`Pasajero:`, x + 5, currentY);
    doc.setDrawColor(...COLORS.LIGHT_GRAY);
    doc.line(x + 30, currentY, x + 120, currentY);
    currentY += 8;
  }
  
  if (excursionInfo) {
    // Fecha/Hora y Salida en la misma línea
    let dateTimeLine = "";
    const dateTime = getExcursionInfoLine(excursionInfo);
    if (dateTime) {
      dateTimeLine = `Fecha/Hora: ${dateTime}`;
    }
    if (excursionInfo.place) {
      if (dateTimeLine) {
        dateTimeLine += ` - Salida: ${excursionInfo.place}`;
      } else {
        dateTimeLine = `Salida: ${excursionInfo.place}`;
      }
    }
    if (dateTimeLine) {
      doc.text(dateTimeLine, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
      currentY += 6;
    }
    
    const stops = formatStops(excursionInfo);
    if (stops) {
      doc.text(`Paradas: ${stops}`, x + 5, currentY, { maxWidth: MAIN_RECEIPT_WIDTH - 10 });
      currentY += 6;
    }
    
    if (excursionInfo.price) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(FONTS.TITLE);
      doc.text(`Precio: ${excursionInfo.price} €`, x + 5, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;
    }
  }
  
  // Emission date - aligned to the right
  doc.setFontSize(FONTS.MEDIUM);
  doc.text("Fecha emisión: __________", x + MAIN_RECEIPT_WIDTH - 50, y + RECEIPT_HEIGHT - 8);
}
