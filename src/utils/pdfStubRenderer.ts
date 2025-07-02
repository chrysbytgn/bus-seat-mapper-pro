
import jsPDF from "jspdf";
import type { Passenger } from "@/components/BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { PDF_CONFIG } from "./pdfConfig";
import { truncateText, formatStops } from "./pdfHelpers";
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
  association: AssociationConfig | null
) {
  const { STUB_WIDTH, RECEIPT_HEIGHT, FONTS, COLORS } = PDF_CONFIG;
  
  // Stub border
  doc.setDrawColor(...COLORS.LIGHT_GRAY);
  doc.rect(x, y, STUB_WIDTH, RECEIPT_HEIGHT);
  
  // Stub content
  doc.setFontSize(FONTS.MEDIUM);
  doc.setTextColor(...COLORS.BLACK);
  
  // Association name (shortened)
  const associationName = association?.name || "Asociación";
  const shortName = truncateText(associationName, 15);
  doc.text(shortName, x + 2, y + 8, { maxWidth: STUB_WIDTH - 4 });
  
  // Receipt number
  doc.setFontSize(FONTS.LARGE);
  doc.text(receiptNumber, x + 2, y + 16);
  
  // Seat number
  doc.setFontSize(FONTS.XLARGE);
  doc.text(`Asiento: ${seatNum}`, x + 2, y + 24);
  
  // Passenger field
  doc.setFontSize(FONTS.SMALL);
  doc.text("Pasajero:", x + 2, y + 32);
  doc.rect(x + 2, y + 34, STUB_WIDTH - 4, 8);
  if (passenger) {
    const fullName = `${passenger.name} ${passenger.surname}`;
    const shortName = truncateText(fullName, 12);
    doc.setFontSize(FONTS.SMALL);
    doc.text(shortName, x + 3, y + 39);
  }
  
  // Phone number
  if (passenger?.phone) {
    doc.setFontSize(FONTS.SMALL);
    doc.text("Tel:", x + 2, y + 46);
    const shortPhone = truncateText(passenger.phone, 12);
    doc.text(shortPhone, x + 2, y + 51);
  }
  
  // Excursion name (shortened)
  if (excursionInfo?.name) {
    const shortExcursion = truncateText(excursionInfo.name, 10);
    doc.setFontSize(FONTS.SMALL);
    doc.text(shortExcursion, x + 2, y + 48, { maxWidth: STUB_WIDTH - 4 });
  }
  
  // Additional stops
  const stops = formatStops(excursionInfo);
  if (stops) {
    doc.setFontSize(FONTS.SMALL);
    doc.text("Paradas:", x + 2, y + 54);
    const shortStops = truncateText(stops, 15);
    doc.text(shortStops, x + 2, y + 59, { maxWidth: STUB_WIDTH - 4 });
  }
  
  // Price
  if (excursionInfo?.price) {
    doc.setFontSize(FONTS.LARGE);
    doc.text(`${excursionInfo.price} €`, x + 2, y + 68);
  }
  
  // Date field
  doc.setFontSize(FONTS.SMALL);
  doc.text("Fecha:", x + 2, y + RECEIPT_HEIGHT - 12);
  doc.text("___________", x + 2, y + RECEIPT_HEIGHT - 6);
}
