
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import type { Passenger } from "./BusSeatMap";
import type { ExcursionData } from "@/pages/Index";
import { getDataURL, formatFecha } from "@/utils/receiptsHelpers";

/**
 * Genera el PDF de recibos estilo 'bloc antiguo'
 * @param seatRange array de n° de asiento
 * @param passengers lista de pasajeros
 * @param excursionInfo info de la excursión
 * @param setGenerating función setter opcional para spinner
 */
export async function generarPDFasientos(seatRange: number[], passengers: Passenger[], excursionInfo: ExcursionData | null, setGenerating?: (v:boolean)=>void) {
  setGenerating?.(true);
  const logoURL = "https://www.pngmart.com/files/21/Travel-PNG-Image-HD.png";
  const logoDataURL = await getDataURL(logoURL);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const fechaEmision = new Date().toLocaleDateString("es-ES");
  const lastSeq = Number(localStorage.getItem("receipt_seq") || "1");
  let actualSeq = lastSeq;
  const recibosPorHoja = 4;
  const colWidth = 100;
  const rowHeight = 145;

  function getPassenger(seat: number) {
    return passengers.find(p => p.seat === seat) || null;
  }
  function siguienteNumeroRecibo(baseNum:number) {
    return "REC-" + String(baseNum).padStart(3, "0");
  }

  seatRange.forEach((seatNum, idx) => {
    const posInPage = idx % recibosPorHoja;
    if (posInPage === 0 && idx !== 0) doc.addPage();
    const col = posInPage % 2;
    const row = Math.floor(posInPage / 2);
    const left = 7 + col * colWidth;
    const top = 10 + row * (rowHeight - 5);
    const p = getPassenger(seatNum);

    for (let i = 0; i < 2; i++) {
      // ORIGINAL / COPIA
      const yBase = top + i * 62;
      const etiqueta = i === 0 ? "ORIGINAL" : "COPIA";
      // --- "bloc antiguo" styling ---
      // Fondo
      doc.setFillColor(255,255,255);
      doc.rect(left + 8, yBase, 84, 58, "F");
      // Mácula lateral
      doc.setFillColor(45, 63, 143);
      doc.rect(left, yBase, 8, 58, "F");
      // Vertical: TALONARIO
      doc.saveGraphicsState?.();
      doc.setTextColor(255,255,255);
      doc.setFontSize(11);
      doc.text("TALONARIO", left + 4.4, yBase + 34, {angle: 270, align:"center", maxWidth: 58});
      doc.restoreGraphicsState?.();
      // Bordes perforados simulados
      for(let yPart = 2; yPart < 58; yPart += 3.2){
        doc.setDrawColor(175,175,175);
        doc.line(left+7.8, yBase + yPart, left+8.5, yBase + yPart + 1);
      }
      // Línea punteada superior (zona de corte)
      doc.setLineDashPattern([1.2,1],0);
      doc.setDrawColor(120,120,120);
      doc.line(left+8, yBase+3.7, left+92, yBase+3.7);
      doc.setLineDashPattern([],0);
      // Cabecera gruesa: RECIBO (azul)
      doc.setFillColor(38,66,139);
      doc.rect(left+8, yBase+4, 84, 11, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13.5);
      doc.setTextColor(255,255,255);
      doc.text("RECIBO", left+50, yBase+12, {align: "center", maxWidth: 83});
      // Logo
      if (logoDataURL) {
        doc.addImage(logoDataURL, "PNG", left + 11.5, yBase + 6.5, 7.5, 7.5);
      }
      // Empresa
      doc.setFont("times", "italic");
      doc.setFontSize(7);
      doc.setTextColor(240,240,240);
      doc.text("Excursiones ABC", left+19.5, yBase+9.8);
      doc.setFontSize(5.8);
      doc.text("Av. Principal 123, Ciudad", left+19.5, yBase+13);
      doc.text("Tel: 555-123-4567", left+19.5, yBase+15);
      doc.setTextColor(90,90,90);
      // Recibo nº y fecha
      doc.setFont("helvetica","bold");
      doc.setFontSize(8.2);
      doc.setTextColor(26,44,106);
      doc.text(`Recibo N°: ${siguienteNumeroRecibo(actualSeq+idx)}`, left+81, yBase+9.5, {align:"right", maxWidth:23});
      doc.setFontSize(6.1);
      doc.setTextColor(95,106,130);
      doc.text(`Fecha: ${fechaEmision}`, left+81, yBase+13.4, {align:"right",maxWidth:23});
      // Etiqueta ORI/COPIA
      doc.setFontSize(6.3);
      doc.setTextColor(100, 100, 100);
      doc.text(`(${etiqueta})`, left+89.2, yBase+16, {align:"right", maxWidth:13});
      // Línea corte vertical
      doc.setLineDashPattern([2.2, 2.2], 0);
      doc.setDrawColor(100);
      doc.line(left + 8, yBase, left + 8, yBase + 58);
      doc.setLineDashPattern([], 0);
      // Detalles asiento y excursión en cuadros tipo bloc
      doc.setDrawColor(140,140,140);
      doc.setFont("times","bold");
      doc.setTextColor(24,34,81);
      doc.rect(left+12, yBase+18, 29, 8, "S");
      doc.setFontSize(7.5);
      doc.text("Asiento n°", left+13, yBase+23.7);
      doc.setFont("courier","bold");
      doc.setFontSize(10.2);
      doc.text(`${seatNum}`, left+30, yBase+23.9, {align:"center",maxWidth:13});
      doc.setDrawColor(150,150,170);
      doc.rect(left+44, yBase+18, 42, 8, "S");
      doc.setFont("times","normal");
      doc.setFontSize(7.2);
      doc.setTextColor(32,28,55);
      doc.text("Pagado por:", left+45, yBase+23.3);
      doc.setDrawColor(190,190,198);
      doc.line(left+62, yBase+25.2, left+84, yBase+25.2);
      if (p) {
        doc.setFontSize(5.7);
        doc.setTextColor(90,110,80);
        doc.text(`Registrado: ${p.name} ${p.surname}`, left+45, yBase+27.7, {maxWidth:38});
      }
      doc.setDrawColor(180,180,180);
      doc.setFont("times","bold");
      doc.rect(left+12, yBase+28, 74, 7.3, "S");
      doc.setFont("times","normal");
      doc.setFontSize(7.5);
      doc.setTextColor(26,44,106);
      doc.text(`Concepto: Excursión ${excursionInfo?.name ? "a "+excursionInfo?.name : ""}`, left+14, yBase+33.6);
      // Fecha y lugar excursión
      if (excursionInfo?.date || excursionInfo?.place) {
        doc.setFont("times","italic");
        doc.setFontSize(6.7);
        doc.setTextColor(70,70,100);
        let yInfo = yBase+38.3;
        if (excursionInfo?.date) {
          doc.text(`Fecha Exc: ${formatFecha(excursionInfo.date)}`, left+14, yInfo);
          yInfo += 4.2;
        }
        if (excursionInfo?.place) {
          doc.text(`Salida: ${excursionInfo.place}`, left+14, yInfo);
        }
      }
      // Zona monto/firma
      doc.setDrawColor(80,80,82);
      doc.setFont("helvetica","bold");
      doc.rect(left+12, yBase+47, 23.4, 7.3, "S");
      doc.rect(left+37, yBase+47, 25, 7.3, "S");
      doc.rect(left+63, yBase+47, 23, 7.3, "S");
      doc.setFontSize(7.6);
      doc.setTextColor(47,47,47);
      doc.text("MONTO (€)", left+13.8, yBase+52);
      doc.text("Forma pago", left+38, yBase+52);
      doc.text("Firma", left+67, yBase+52);
      // Marca de agua PAGADO
      if (typeof doc.saveGraphicsState === "function" && typeof doc.setGState === "function") {
        doc.saveGraphicsState();
        doc.setTextColor(180, 180, 180);
        doc.setFont("courier","bold");
        doc.setFontSize(18);
        // @ts-ignore
        doc.setGState(new doc.GState({ opacity: 0.22 }));
        doc.text("PAGADO", left+49, yBase+57.4, {align: "center", angle: -8});
        doc.restoreGraphicsState();
      } else {
        doc.setTextColor(180, 180, 180);
        doc.setFont("courier","bold");
        doc.setFontSize(18);
        doc.text("PAGADO", left+49, yBase+57.4, {align: "center", angle: -8});
      }
    }
  });

  localStorage.setItem("receipt_seq", String(lastSeq + seatRange.length));
  doc.save("recibos_excursion.pdf");
  setGenerating?.(false);
}
