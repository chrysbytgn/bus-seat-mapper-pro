
import jsPDF from "jspdf";
import type { Passenger } from "@/components/BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { PDF_CONFIG } from "./pdfConfig";
import { truncateText, formatStops, splitTextIntoLines } from "./pdfHelpers";
import type { AssociationConfig } from "@/utils/associationConfig";

/**
 * Renders the receipt stub (talón) on the left side
 */
export function renderReceiptStub(
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
  const { STUB_WIDTH, RECEIPT_HEIGHT, FONTS, COLORS } = PDF_CONFIG;
  
  // Stub border
  doc.setDrawColor(...COLORS.LIGHT_GRAY);
  doc.rect(x, y, STUB_WIDTH, RECEIPT_HEIGHT);
  
  let currentY = y + 5;
  
  // Association logo at the top
  if (logoDataURL) {
    try {
      doc.addImage(logoDataURL, "PNG", x + 2, currentY, 10, 10);
      currentY += 12;
    } catch (error) {
      console.log("Error al añadir logo al talón");
      currentY += 2;
    }
  }
  
  // Association name (full name, multiple lines if needed)
  if (association?.name) {
    doc.setFontSize(FONTS.SMALL);
    doc.setTextColor(...COLORS.BLACK);
    const nameLines = splitTextIntoLines(association.name, 15);
    nameLines.forEach((line, index) => {
      doc.text(line, x + 2, currentY + (index * 4));
    });
    currentY += nameLines.length * 4 + 2;
  }
  
  // Receipt number
  doc.setFontSize(FONTS.MEDIUM);
  doc.setTextColor(...COLORS.BLACK);
  doc.text(receiptNumber, x + 2, currentY);
  currentY += 6;
  
  // Seat number
  doc.setFontSize(FONTS.LARGE);
  doc.text(`Asiento: ${seatNum}`, x + 2, currentY);
  currentY += 8;
  
  // Passenger field
  doc.setFontSize(FONTS.SMALL);
  doc.text("Pasajero:", x + 2, currentY);
  currentY += 3;
  doc.rect(x + 2, currentY, STUB_WIDTH - 4, 6);
  if (passenger) {
    const fullName = `${passenger.name} ${passenger.surname}`;
    const shortName = truncateText(fullName, 12);
    doc.text(shortName, x + 3, currentY + 4);
  }
  currentY += 8;
  
  // Phone number
  if (passenger?.phone) {
    doc.setFontSize(FONTS.SMALL);
    doc.text("Tel:", x + 2, currentY);
    currentY += 3;
    const shortPhone = truncateText(passenger.phone, 12);
    doc.text(shortPhone, x + 2, currentY);
    currentY += 5;
  }
  
  // Excursion name (shortened)
  if (excursionInfo?.name) {
    const shortExcursion = truncateText(excursionInfo.name, 10);
    doc.setFontSize(FONTS.SMALL);
    doc.text(shortExcursion, x + 2, currentY);
    currentY += 4;
  }
  
  // Additional stops
  const stops = formatStops(excursionInfo);
  if (stops) {
    doc.setFontSize(FONTS.SMALL);
    doc.text("Paradas:", x + 2, currentY);
    currentY += 3;
    const shortStops = truncateText(stops, 15);
    doc.text(shortStops, x + 2, currentY);
    currentY += 4;
  }
  
  // Price
  if (excursionInfo?.price) {
    doc.setFontSize(FONTS.MEDIUM);
    doc.text(`${excursionInfo.price} €`, x + 2, currentY);
    currentY += 6;
  }
  
  // Date field at the bottom
  doc.setFontSize(FONTS.SMALL);
  doc.text("Fecha:", x + 2, y + RECEIPT_HEIGHT - 8);
  doc.text("___________", x + 2, y + RECEIPT_HEIGHT - 4);
}
