
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import type { Passenger } from "./BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { getDataURL, formatFecha } from "@/utils/receiptsHelpers";
import { getAssociationConfig } from "@/utils/associationConfig"; // Para datos de asociación

/**
 * Genera el PDF de recibos estilo 'bloc antiguo' versión 2024-06-14, 6 por página horizontal grande.
 * @param seatRange array de n° de asiento
 * @param passengers lista de pasajeros
 * @param excursionInfo info de la excursión
 * @param setGenerating función setter opcional para spinner
 */
export async function generarPDFasientos(
  seatRange: number[],
  passengers: Passenger[],
  excursionInfo: ExcursionData | null,
  setGenerating?: (v: boolean) => void
) {
  setGenerating?.(true);

  const association = getAssociationConfig();

  // --- LOGO y datos asociación ---
  const logoURL = association?.logo || "https://www.pngmart.com/files/21/Travel-PNG-Image-HD.png";
  const logoDataURL = await getDataURL(logoURL);

  // Parámetros nuevos para mayor tamaño y 6 recibos/hoja
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  // Emisión vacía, para rellenar luego
  const fechaEmision = ""; 
  const lastSeq = Number(localStorage.getItem("receipt_seq") || "1");
  let actualSeq = lastSeq;
  // 2 columnas, 3 filas (6 recibos/hoja)
  const recibosPorHoja = 6;
  const cols = 2;
  const rows = 3;
  // NUEVO: dimensiones de los recibos más grandes
  const widthCopia = 34;
  const widthOri = 90;
  const sepCols = 6; // espacio entre copia y original
  const recHeight = 92;
  const marginLeft = 8;
  const marginTop = 7;
  const verticalGap = 3;

  function getPassenger(seat: number) {
    return passengers.find(p => p.seat === seat) || null;
  }
  function siguienteNumeroRecibo(baseNum: number) {
    return "REC-" + String(baseNum).padStart(3, "0");
  }
  function infoExcursionLinea() {
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

  seatRange.forEach((seatNum, idx) => {
    const posInPage = idx % recibosPorHoja;
    if (posInPage === 0 && idx !== 0) doc.addPage();
    const col = posInPage % cols;
    const row = Math.floor(posInPage / cols);
    // Posicionamiento horizontal
    const leftCopia = marginLeft + col * (widthCopia + widthOri + sepCols + 8);
    const leftOri = leftCopia + widthCopia + sepCols;
    const top = marginTop + row * (recHeight + verticalGap);

    const p = getPassenger(seatNum);

    // COPIA (izquierda, más reducida)
    doc.setFillColor(255, 255, 255);
    doc.rect(leftCopia, top, widthCopia, recHeight, "F");
    if (logoDataURL) doc.addImage(logoDataURL, "PNG", leftCopia + 2, top + 3, 9, 9);
    doc.setFontSize(8.1);
    doc.setTextColor(0, 0, 0);
    doc.text((association?.name || "Asociación"), leftCopia + 13, top + 8);
    doc.setFontSize(6.6);
    doc.text("RECIBO COPIA", leftCopia + 2, top + 16);
    doc.setFontSize(7);
    doc.text(`Recibo N°: ${siguienteNumeroRecibo(actualSeq + idx)}`, leftCopia + 2, top + 22);
    doc.text(`Asiento: ${seatNum}`, leftCopia + 2, top + 27);
    if (p) doc.text(`${p.name} ${p.surname}`, leftCopia + 2, top + 32, { maxWidth: widthCopia-4 });
    doc.setFontSize(6.3);
    if (excursionInfo) {
      doc.text(`Exc. ${excursionInfo.name || ""}`, leftCopia + 2, top + 39, { maxWidth: widthCopia-4 });
      doc.text(infoExcursionLinea(), leftCopia + 2, top + 44, { maxWidth: widthCopia-4 });
      if (excursionInfo.stops?.length)
        doc.text(("Paradas: "+excursionInfo.stops.join(", ")).slice(0,70), leftCopia+2, top+49, {maxWidth: widthCopia-4});
    }
    doc.text(("Precio: " + (excursionInfo?.price || "-") + " €"), leftCopia + 2, top + 56);
    doc.setFontSize(5.5);
    doc.text((association?.address || ""), leftCopia+2, top+recHeight-10, { maxWidth: widthCopia-4 });
    doc.text((association?.phone || ""), leftCopia+2, top+recHeight-6, { maxWidth: widthCopia-4 });
    // DEJAR BLOQUE VACÍO PARA FECHA EMISIÓN
    doc.setFontSize(5.5);
    doc.text("Fecha emisión: ____________________", leftCopia + 2, top + recHeight - 2);

    // Línea discontinua vertical entre copia y original
    doc.setLineDashPattern([1.2, 2.3], 0);
    doc.setDrawColor(130, 130, 130);
    doc.line(leftOri - (sepCols/2), top, leftOri - (sepCols/2), top + recHeight);
    doc.setLineDashPattern([], 0);

    // ORIGINAL (derecha, más grande)
    doc.setFillColor(255, 255, 255);
    doc.rect(leftOri, top, widthOri, recHeight, "F");
    if (logoDataURL) doc.addImage(logoDataURL, "PNG", leftOri + 2, top + 4, 17, 17);
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text((association?.name || "Asociación"), leftOri + 22, top + 13);
    doc.setFontSize(8.8);
    doc.setTextColor(50, 50, 50);
    doc.text((association?.address || ""), leftOri + 22, top + 19, { maxWidth: widthOri-22 });
    doc.text((association?.phone || ""), leftOri + 22, top + 24, { maxWidth: widthOri-22 });
    doc.setFontSize(10.5);
    doc.text("RECIBO EXCURSIÓN", leftOri + widthOri - 7, top + 13, { align: "right" });
    doc.setFontSize(10.3);
    doc.text(`Recibo N°: ${siguienteNumeroRecibo(actualSeq + idx)}`, leftOri + widthOri - 8, top + 19, { align: "right", maxWidth: 27 });
    doc.setFontSize(9);
    doc.setTextColor(45, 45, 46);
    if (excursionInfo?.name)
      doc.text(`Excursión: ${excursionInfo?.name}`, leftOri + 3, top + 31);
    doc.text("Asiento:", leftOri + 3, top + 37);
    doc.text(String(seatNum), leftOri + 29, top + 37);
    if (p) doc.text(`Pasajero: ${p.name} ${p.surname}`, leftOri + 3, top + 42, { maxWidth: widthOri-6 });
    if (excursionInfo) {
      doc.text(`Fecha: ${excursionInfo.date ? formatFecha(excursionInfo.date) : "-"}`, leftOri + 3, top + 49);
      doc.text(`Hora: ${excursionInfo.time || "-"}`, leftOri + widthOri/2, top + 49);
      doc.text(`Salida: ${excursionInfo.place || "-"}`, leftOri + 3, top + 54, { maxWidth: widthOri-6 });
      if (excursionInfo.stops?.length)
        doc.text(
          "Paradas: " + excursionInfo.stops.join(", "),
          leftOri + 3,
          top + 59,
          { maxWidth: widthOri-6 }
        );
    }
    doc.text(`Precio: ${excursionInfo?.price || "-"} €`, leftOri + 3, top + 66);
    // Bloque vacío para fecha emisión
    doc.setFontSize(7.3);
    doc.text("Fecha emisión: ____________________", leftOri + widthOri-4, top + recHeight - 7, { align: "right", maxWidth: 61 });
    // Marca de agua PAGADO
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(33);
    doc.text("PAGADO", leftOri + widthOri/2, top + 45, { align: "center", angle: -11 });

    // Separador horizontal por recibo (sólo si hay filas extra)
    if(row < rows-1) {
      doc.setLineDashPattern([2.5, 3], 0);
      doc.setDrawColor(170, 170, 170);
      doc.line(leftCopia, top + recHeight, leftOri + widthOri, top + recHeight);
      doc.setLineDashPattern([], 0);
    }
  });

  localStorage.setItem("receipt_seq", String(lastSeq + seatRange.length));
  doc.save("recibos_excursion.pdf");
  setGenerating?.(false);
}

