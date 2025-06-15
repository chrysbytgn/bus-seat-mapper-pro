import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import type { Passenger } from "./BusSeatMap";
import type { ExcursionData } from "@/pages/Index";

interface Props {
  open: boolean;
  onClose: () => void;
  passengers: Passenger[];
  excursionInfo: ExcursionData | null;
}

/**
 * Recibo autogenerado "vintage" para cada pasajero con mácula (control), corte y estilo bloc antiguo.
 */
export function SeatReceiptsModal({ open, onClose, passengers, excursionInfo }: Props) {
  const [generating, setGenerating] = useState(false);
  const seatRange = Array.from({ length: 55 }, (_, i) => i + 1);

  function getPassenger(seat:number){
    return passengers.find(p => p.seat === seat) || null;
  }
  const sortedSeatList = seatRange.map(n => ({
    seat: n,
    ...getPassenger(n),
  }));
  function siguienteNumeroRecibo(baseNum: number) {
    return "REC-" + String(baseNum).padStart(3, "0");
  }

  async function generarPDFasientos() {
    setGenerating(true);
    const logoURL = "https://www.pngmart.com/files/21/Travel-PNG-Image-HD.png";
    const logoDataURL = await getDataURL(logoURL);
    // Configuración bloc antiguo
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const fechaEmision = new Date().toLocaleDateString("es-ES");
    const lastSeq = Number(localStorage.getItem("receipt_seq") || "1");
    let actualSeq = lastSeq;

    // Layout: 4 por hoja, área ajustada con bordes a "bloc"
    const recibosPorHoja = 4;
    const colWidth = 100;
    const rowHeight = 145;

    seatRange.forEach((seatNum, idx) => {
      const posInPage = idx % recibosPorHoja;
      if (posInPage === 0 && idx !== 0) doc.addPage();
      const col = posInPage % 2;
      const row = Math.floor(posInPage / 2);
      const left = 7 + col * colWidth;
      const top = 10 + row * (rowHeight - 5);
      const p = getPassenger(seatNum);

      for (let i = 0; i < 2; i++) {
        // Original/Copia
        const yBase = top + i * 62;
        const etiqueta = i === 0 ? "ORIGINAL" : "COPIA";

        // --- LADO "BLOC ANTIGUO": bordes, talonario, mácula, etc. ---
        // Area grande de recibo (fondo blanco)
        doc.setFillColor(255,255,255);
        doc.rect(left + 8, yBase, 84, 58, "F");

        // Mácula lateral de control
        doc.setFillColor(45, 63, 143);
        doc.rect(left, yBase, 8, 58, "F");

        // Marca "TALONARIO" en vertical en la mácula
        doc.saveGraphicsState?.();
        doc.setTextColor(255,255,255);
        doc.setFontSize(11);
        doc.text("TALONARIO", left + 4.4, yBase + 34, {angle: 270, align:"center", maxWidth: 58});
        doc.restoreGraphicsState?.();

        // Bordes exteriores perforados (simula talonario, puntitos a la izq)
        for(let yPart = 2; yPart < 58; yPart += 3.2){
          doc.setDrawColor(175,175,175);
          doc.line(left+7.8, yBase + yPart, left+8.5, yBase + yPart + 1);
        }

        // Línea punteada superior (zona de corte del "bloc")
        doc.setLineDashPattern([1.2,1],0);
        doc.setDrawColor(120,120,120);
        doc.line(left+8, yBase+3.7, left+92, yBase+3.7); // tope superior
        doc.setLineDashPattern([],0);

        // Cabecera grande: Recibo
        doc.setFillColor(38,66,139);
        doc.rect(left+8, yBase+4, 84, 11, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13.5);
        doc.setTextColor(255,255,255);
        doc.text("RECIBO", left+50, yBase+12, {align: "center", maxWidth: 83});

        // Logo empresa a la izq
        if (logoDataURL) {
          doc.addImage(logoDataURL, "PNG", left + 11.5, yBase + 6.5, 7.5, 7.5);
        }
        // Datos empresa
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

        // Etiqueta ORIGINAL/COPIA
        doc.setFontSize(6.3);
        doc.setTextColor(100, 100, 100);
        doc.text(`(${etiqueta})`, left+89.2, yBase+16, {align:"right", maxWidth:13});

        // Línea de corte vertical
        doc.setLineDashPattern([2.2, 2.2], 0);
        doc.setDrawColor(100);
        doc.line(left + 8, yBase, left + 8, yBase + 58);
        doc.setLineDashPattern([], 0);

        // - Detalles asiento y excursión en CUADROS tipo talonario
        // Asiento y nombre vacío para rellenar a mano
        doc.setDrawColor(140,140,140);
        doc.setFont("times","bold");
        doc.setTextColor(24,34,81);
        doc.rect(left+12, yBase+18, 29, 8, "S");
        doc.setFontSize(7.5);
        doc.text("Asiento n°", left+13, yBase+23.7);
        doc.setFont("courier","bold");
        doc.setFontSize(10.2);
        doc.text(`${seatNum}`, left+30, yBase+23.9, {align:"center",maxWidth:13});

        // Cuadro para nombre manuscrito y leyenda
        doc.setDrawColor(150,150,170);
        doc.rect(left+44, yBase+18, 42, 8, "S");
        doc.setFont("times","normal");
        doc.setFontSize(7.2);
        doc.setTextColor(32,28,55);
        doc.text("Pagado por:", left+45, yBase+23.3);
        doc.setDrawColor(190,190,198);

        // Línea para nombre
        doc.line(left+62, yBase+25.2, left+84, yBase+25.2);

        // Fila referencia de pasajero si existe
        if (p) {
          doc.setFontSize(5.7);
          doc.setTextColor(90,110,80);
          doc.text(`Registrado: ${p.name} ${p.surname}`, left+45, yBase+27.7, {maxWidth:38});
        }

        // Concepto excursión / destino
        doc.setDrawColor(180,180,180);
        doc.setFont("times","bold");
        doc.rect(left+12, yBase+28, 74, 7.3, "S");
        doc.setFont("times","normal");
        doc.setFontSize(7.5);
        doc.setTextColor(26,44,106);
        doc.text(`Concepto: Excursión ${excursionInfo?.name ? "a "+excursionInfo?.name : ""}`, left+14, yBase+33.6);

        // Fecha y lugar excursión (si hay)
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

        // Zona para MONTO y firma
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

        // Cuadros vacíos para rellenar a mano
        // Monto/forma/firma
        // (Sin texto, solo cuadros)

        // Marca de agua PAGADO (sutil, vintage)
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
    setGenerating(false);
  }

  return (
    <Dialog open={open} onOpenChange={v => !v ? onClose() : undefined}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generar recibos de asientos</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Se generarán recibos para <b>todos los asientos del bus</b>, ocupados o vacíos, con estilo “bloc antiguo”. Cada recibo tiene mácula, zona perforada, línea de corte y espacio para escribir a mano.
            </p>
          </div>
          <div className="max-h-36 overflow-auto mb-2 border rounded bg-muted px-3 py-2">
            <ul className="flex flex-col gap-[2px] text-sm">
              {sortedSeatList.map((info) =>
                <li key={info.seat} className="flex items-center gap-2">
                  <span className="font-semibold">Asiento {info.seat}</span>
                  <span className="text-xs text-muted-foreground">
                    {info.name && info.surname ? `${info.name} ${info.surname}` : <span className="italic text-slate-400">Sin pasajero</span>}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button disabled={generating} onClick={generarPDFasientos}>{generating ? "Generando..." : "Descargar PDF (todos los asientos)"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helpers
async function getDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}
function formatFecha(fecha: string) {
  if (!fecha) return "";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-ES");
}
