
import jsPDF from "jspdf";
import type { Passenger } from "./BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { getDataURL } from "@/utils/receiptsHelpers";
import { getAssociationConfig } from "@/utils/associationConfig";
import { PDF_CONFIG } from "@/utils/pdfConfig";
import { generateReceiptNumber } from "@/utils/pdfHelpers";
import { renderReceiptStub } from "@/utils/pdfStubRenderer";
import { renderMainReceipt } from "@/utils/pdfMainReceiptRenderer";

/**
 * Genera el PDF de recibos con talón lateral - 3 recibos por página vertical
 */
export async function generarPDFasientos(
  seatRange: number[],
  passengers: Passenger[],
  excursionInfo: ExcursionData | null,
  setGenerating?: (v: boolean) => void
) {
  setGenerating?.(true);

  const association = getAssociationConfig();
  const { 
    RECEIPTS_PER_PAGE, 
    RECEIPT_HEIGHT, 
    RECEIPT_WIDTH, 
    STUB_WIDTH,
    MAIN_RECEIPT_LEFT_OFFSET,
    MARGIN_LEFT, 
    MARGIN_TOP, 
    VERTICAL_GAP,
    COLORS 
  } = PDF_CONFIG;

  // Load logo
  const logoURL = association?.logo || "https://www.pngmart.com/files/21/Travel-PNG-Image-HD.png";
  let logoDataURL = null;
  try {
    logoDataURL = await getDataURL(logoURL);
  } catch (error) {
    console.log("No se pudo cargar el logo, continuando sin él");
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const lastSeq = Number(localStorage.getItem("receipt_seq") || "1");
  let actualSeq = lastSeq;

  function getPassenger(seat: number) {
    return passengers.find(p => p.seat === seat) || null;
  }

  seatRange.forEach((seatNum, idx) => {
    const posInPage = idx % RECEIPTS_PER_PAGE;
    if (posInPage === 0 && idx !== 0) doc.addPage();
    
    const top = MARGIN_TOP + posInPage * (RECEIPT_HEIGHT + VERTICAL_GAP);
    const passenger = getPassenger(seatNum);
    const receiptNumber = generateReceiptNumber(actualSeq + idx);

    // White background
    doc.setFillColor(...COLORS.WHITE);
    doc.rect(MARGIN_LEFT, top, RECEIPT_WIDTH, RECEIPT_HEIGHT, "F");
    
    // === RECEIPT STUB (LEFT SIDE) ===
    renderReceiptStub(
      doc, 
      MARGIN_LEFT, 
      top, 
      seatNum, 
      passenger, 
      receiptNumber, 
      excursionInfo, 
      association
    );

    // === DOTTED SEPARATOR LINE ===
    const lineX = MARGIN_LEFT + STUB_WIDTH + 2;
    doc.setLineDashPattern([2, 2], 0);
    doc.setDrawColor(120, 120, 120);
    doc.line(lineX, top + 5, lineX, top + RECEIPT_HEIGHT - 5);
    doc.setLineDashPattern([], 0);

    // === MAIN RECEIPT (RIGHT SIDE) ===
    const receiptLeft = MARGIN_LEFT + STUB_WIDTH + MAIN_RECEIPT_LEFT_OFFSET;
    renderMainReceipt(
      doc,
      receiptLeft,
      top,
      seatNum,
      passenger,
      receiptNumber,
      excursionInfo,
      association,
      logoDataURL
    );

    // Separator line between receipts (except the last one)
    if (posInPage < RECEIPTS_PER_PAGE - 1) {
      doc.setLineDashPattern([3, 3], 0);
      doc.setDrawColor(...COLORS.LIGHT_GRAY);
      doc.line(MARGIN_LEFT, top + RECEIPT_HEIGHT + VERTICAL_GAP/2, MARGIN_LEFT + RECEIPT_WIDTH, top + RECEIPT_HEIGHT + VERTICAL_GAP/2);
      doc.setLineDashPattern([], 0);
    }
  });

  localStorage.setItem("receipt_seq", String(lastSeq + seatRange.length));
  doc.save("recibos_excursion.pdf");
  setGenerating?.(false);
}
