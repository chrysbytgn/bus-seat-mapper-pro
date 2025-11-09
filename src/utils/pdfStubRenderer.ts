
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
  
  // Header: logo + association name inline
  let currentY = y + 5;
  const logoSize = 10;
  let nameStartX = x + 2;
  let logoAdded = false;
  
  if (logoDataURL) {
    try {
      doc.addImage(logoDataURL, "PNG", x + 2, currentY, logoSize, logoSize);
      nameStartX = x + 2 + logoSize + 2;
      logoAdded = true;
    } catch (error) {
      console.log("Error al añadir logo al talón");
    }
  }
  
  // Association name to the right of logo (wrap if needed)
  let nameLines: string[] = [];
  if (association?.name) {
    doc.setFontSize(FONTS.SMALL);
    doc.setTextColor(...COLORS.BLACK);
    nameLines = splitTextIntoLines(association.name, 14);
    nameLines.forEach((line, index) => {
      doc.text(line, nameStartX, currentY + 3 + (index * 4));
    });
  }
  
  const nameBlockHeight = nameLines.length * 4 + (nameLines.length ? 2 : 0);
  const headerHeight = Math.max(logoAdded ? logoSize : 0, nameBlockHeight);
  currentY = y + 5 + headerHeight + 2;
  
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
  doc.setFontSize(FONTS.MEDIUM);
  doc.text("Pasajero:", x + 2, currentY);
  currentY += 3;
  // Cambiar rectángulo por línea continua
  doc.setDrawColor(...COLORS.LIGHT_GRAY);
  doc.line(x + 2, currentY + 3, x + STUB_WIDTH - 2, currentY + 3);
  if (passenger) {
    const fullName = `${passenger.name} ${passenger.surname}`;
    const shortName = truncateText(fullName, 12);
    doc.setFontSize(FONTS.MEDIUM);
    doc.text(shortName, x + 3, currentY + 2);
  }
  currentY += 8;
  
  // Phone number
  if (passenger?.phone) {
    doc.setFontSize(FONTS.MEDIUM);
    doc.text("Tel:", x + 2, currentY);
    currentY += 3;
    const shortPhone = truncateText(passenger.phone, 12);
    doc.setFontSize(FONTS.MEDIUM);
    doc.text(shortPhone, x + 2, currentY);
    currentY += 5;
  }
  
  // Excursion name (shortened)
  if (excursionInfo?.name) {
    const shortExcursion = truncateText(excursionInfo.name, 10);
    doc.setFontSize(FONTS.MEDIUM);
    doc.text(shortExcursion, x + 2, currentY);
    currentY += 4;
  }
  
  // Price - larger and bold
  if (excursionInfo?.price) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONTS.TITLE);
    doc.text(`${excursionInfo.price} €`, x + 2, currentY);
    doc.setFont("helvetica", "normal");
    currentY += 6;
  }
  
  // Date field at the bottom
  doc.setFontSize(FONTS.MEDIUM);
  doc.text("Fecha:", x + 2, y + RECEIPT_HEIGHT - 8);
  doc.text("___________", x + 14, y + RECEIPT_HEIGHT - 8);
}
