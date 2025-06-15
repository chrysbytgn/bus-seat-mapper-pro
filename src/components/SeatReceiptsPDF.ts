import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import type { Passenger } from "./BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { getDataURL, formatFecha } from "@/utils/receiptsHelpers";
import { getAssociationConfig } from "@/utils/associationConfig"; // Para datos de asociación

/**
 * Genera el PDF de recibos estilo 'bloc antiguo'
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

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const fechaEmision = new Date().toLocaleDateString("es-ES");
  const lastSeq = Number(localStorage.getItem("receipt_seq") || "1");
  let actualSeq = lastSeq;
  const recibosPorHoja = 4;
  const colWidth = 100;
  const rowHeight = 66;

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
    const col = posInPage % 2;
    const row = Math.floor(posInPage / 2);
    // Nueva lógica: copia reduc. izquierda, original derecha, línea discontinua col=1
    const leftCopia = col === 0 ? 7 : 108;
    const leftOri = col === 0 ? 36 : 137;
    const top = 10 + row * rowHeight;

    const p = getPassenger(seatNum);

    // COPIA — más pequeña, izquierda
    doc.setFillColor(255, 255, 255);
    doc.rect(leftCopia, top, 28, 66, "F");
    if (logoDataURL) doc.addImage(logoDataURL, "PNG", leftCopia + 1, top + 2, 7, 7);
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text((association?.name || "Asociación"), leftCopia + 11, top + 6);
    doc.setFontSize(6);
    doc.text("RECIBO COPIA", leftCopia + 1, top + 14);
    doc.setFontSize(6.2);
    doc.text(`Recibo N°: ${siguienteNumeroRecibo(actualSeq+idx)}`, leftCopia + 1, top + 19);
    doc.text(`Asiento: ${seatNum}`, leftCopia + 1, top + 23);
    if (p) doc.text(`${p.name} ${p.surname}`, leftCopia + 1, top + 27, { maxWidth: 24 });
    doc.setFontSize(5.1);
    if (excursionInfo) {
      doc.text(`Exc. ${excursionInfo.name || ""}`, leftCopia + 1, top + 33, { maxWidth: 26 });
      doc.text(infoExcursionLinea(), leftCopia + 1, top + 37, { maxWidth: 26 });
      if (excursionInfo.stops?.length)
        doc.text(("Paradas: "+excursionInfo.stops.join(", ")).slice(0,68), leftCopia+1, top+42, {maxWidth: 26});
    }
    doc.text(("Precio: " + (excursionInfo?.price || "-") + "€"), leftCopia + 1, top + 48);
    doc.setFontSize(4.4);
    doc.text((association?.address || ""), leftCopia+1, top+63, { maxWidth: 25 });
    doc.text((association?.phone || ""), leftCopia+1, top+65, { maxWidth: 25 });

    // Línea discontinua vertical entre copia y original (solo una vez por recibo)
    doc.setLineDashPattern([1.0, 1.6], 0);
    doc.setDrawColor(110, 110, 110);
    doc.line(leftOri - 5, top, leftOri - 5, top + 66);
    doc.setLineDashPattern([], 0);

    // ORIGINAL — más grande, derecha
    doc.setFillColor(255, 255, 255);
    doc.rect(leftOri, top, 64, 66, "F");
    if (logoDataURL) doc.addImage(logoDataURL, "PNG", leftOri + 1.5, top + 2, 13, 13);
    doc.setFontSize(10.8);
    doc.setTextColor(0, 0, 0);
    doc.text((association?.name || "Asociación"), leftOri + 16, top + 11.3);
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text((association?.address || ""), leftOri + 16, top + 16.2, { maxWidth: 47 });
    doc.text((association?.phone || ""), leftOri + 16, top + 20, { maxWidth: 47 });
    doc.setFontSize(8.3);
    doc.text("RECIBO EXCURSIÓN", leftOri + 34, top + 9, { align: "right" });
    doc.setFontSize(8.2);
    doc.text(`Recibo N°: ${siguienteNumeroRecibo(actualSeq + idx)}`, leftOri + 43, top + 15.8, { align: "right", maxWidth: 21 });
    doc.setFontSize(7.5);
    doc.setTextColor(45, 45, 46);
    if (excursionInfo?.name)
      doc.text(`Excursión: ${excursionInfo?.name}`, leftOri + 2, top + 25);
    doc.text("Asiento:", leftOri + 2, top + 31);
    doc.text(String(seatNum), leftOri + 26, top + 31);
    if (p) doc.text(`Pasajero: ${p.name} ${p.surname}`, leftOri + 2, top + 36, { maxWidth: 58 });
    if (excursionInfo) {
      doc.text(`Fecha: ${excursionInfo.date ? formatFecha(excursionInfo.date) : "-"}`, leftOri + 2, top + 42);
      doc.text(`Hora: ${excursionInfo.time || "-"}`, leftOri + 34, top + 42);
      doc.text(`Salida: ${excursionInfo.place || "-"}`, leftOri + 2, top + 47, { maxWidth: 60 });
      if (excursionInfo.stops?.length)
        doc.text(
          "Paradas: " + excursionInfo.stops.join(", "),
          leftOri + 2,
          top + 52,
          { maxWidth: 60 }
        );
    }
    doc.text(`Precio: ${excursionInfo?.price || "-"} €`, leftOri + 2, top + 58);
    doc.setFontSize(6.2);
    doc.text(`Fecha emision: ${fechaEmision}`, leftOri + 44, top + 63, { align: "right", maxWidth: 20 });
    // Marca de agua clara
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(24);
    doc.text("RECIBO", leftOri + 32, top + 39.5, { align: "center", angle: -10 });

    // Separador horizontal por recibo (solo si 2 en la hoja)
    if(row === 0) {
      doc.setLineDashPattern([1.8, 2], 0);
      doc.setDrawColor(140, 140, 140);
      doc.line(leftCopia, top + 66, leftOri + 64, top + 66);
      doc.setLineDashPattern([], 0);
    }
  });

  localStorage.setItem("receipt_seq", String(lastSeq + seatRange.length));
  doc.save("recibos_excursion.pdf");
  setGenerating?.(false);
}
