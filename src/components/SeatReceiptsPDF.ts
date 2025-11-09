
import jsPDF from "jspdf";
import type { Passenger } from "@/components/BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { renderMainReceipt } from "@/utils/pdfMainReceiptRenderer";
import { renderReceiptStub } from "@/utils/pdfStubRenderer";
import { PDF_CONFIG } from "@/utils/pdfConfig";
import { generateReceiptNumber } from "@/utils/pdfHelpers";
import { getAssociationConfig } from "@/utils/associationConfig";
import { getDataURL } from "@/utils/receiptsHelpers";

export async function generateReceiptsPDF(
  passengers: Passenger[],
  excursionInfo: ExcursionData | null,
  startNumber: number = 1
): Promise<void> {
  const {
    RECEIPTS_PER_PAGE,
    RECEIPT_HEIGHT,
    RECEIPT_WIDTH,
    MARGIN_LEFT,
    MARGIN_TOP,
    VERTICAL_GAP,
    STUB_WIDTH,
    DIVIDER_LINE_X_OFFSET,
    COLORS,
  } = PDF_CONFIG;
  
  const marginLeft = MARGIN_LEFT;
  const marginTop = MARGIN_TOP;
  const receiptHeight = RECEIPT_HEIGHT;
  const receiptWidth = RECEIPT_WIDTH;
  const receiptsPerPage = RECEIPTS_PER_PAGE;
  const verticalGap = VERTICAL_GAP;
  const stubWidth = STUB_WIDTH;
  const dividerOffset = DIVIDER_LINE_X_OFFSET;
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  // Fetch association data
  const association = getAssociationConfig();
  let logoDataURL: string | null = null;
  if (association?.logo) {
    logoDataURL = await getDataURL(association.logo);
  }
  
  for (let i = 0; i < passengers.length; i++) {
    const passenger = passengers[i];
    const pageIndex = Math.floor(i / receiptsPerPage);
    const positionOnPage = i % receiptsPerPage;
    
    if (positionOnPage === 0) {
      // Add a new page for each set of receipts
      if (pageIndex > 0) {
        doc.addPage();
      }
    }
    
    const yPosition = marginTop + positionOnPage * (receiptHeight + verticalGap);
    const receiptNum = startNumber + i;
    const receiptNumber = generateReceiptNumber(receiptNum);
    
    // Main receipt (right side)
    renderMainReceipt(
      doc,
      stubWidth + marginLeft + dividerOffset,
      yPosition,
      passenger.seat,
      passenger,
      receiptNumber,
      excursionInfo,
      association,
      logoDataURL
    );
    
    // Receipt stub (left side) - NOW WITH LOGO
    renderReceiptStub(
      doc,
      marginLeft,
      yPosition,
      passenger.seat,
      passenger,
      receiptNumber,
      excursionInfo,
      association,
      logoDataURL  // Add logoDataURL parameter
    );
    
    // Divider line
    doc.line(
      stubWidth + marginLeft + dividerOffset - 1,
      yPosition,
      stubWidth + marginLeft + dividerOffset - 1,
      yPosition + receiptHeight
    );
    
    // Marco completo del recibo para facilitar el corte
    doc.setDrawColor(...COLORS.LIGHT_GRAY);
    doc.rect(marginLeft, yPosition, receiptWidth, receiptHeight);
  }
  
  // Download the PDF directly
  const fileName = `recibos_${excursionInfo?.name || 'excursion'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
