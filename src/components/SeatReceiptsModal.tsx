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
 * Recibo autogenerado para cada pasajero con mácula (control) y corte.
 */
export function SeatReceiptsModal({ open, onClose, passengers, excursionInfo }: Props) {
  const [generating, setGenerating] = useState(false);

  // Genera el array de 55 asientos (1 a 55)
  const seatRange = Array.from({ length: 55 }, (_, i) => i + 1);

  // Devuelve el pasajero si existe para ese asiento
  function getPassenger(seat:number){
    return passengers.find(p => p.seat === seat) || null;
  }

  // Para mostrar en la lista previa
  const sortedSeatList = seatRange.map(n => ({
    seat: n,
    ...getPassenger(n),
  }));

  // Obtiene siguiente número de recibo básico (puede personalizarse según negocio real)
  function siguienteNumeroRecibo(baseNum: number) {
    return "REC-" + String(baseNum).padStart(3, "0");
  }

  // Genera todos los recibos (1 al 55) en 1 PDF
  async function generarPDFasientos() {
    setGenerating(true);
    const logoURL = "https://www.pngmart.com/files/21/Travel-PNG-Image-HD.png";
    const logoDataURL = await getDataURL(logoURL);
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const fechaEmision = new Date().toLocaleDateString("es-ES");
    const lastSeq = Number(localStorage.getItem("receipt_seq") || "1");
    let actualSeq = lastSeq;

    seatRange.forEach((seatNum, idx) => {
      const p = getPassenger(seatNum);
      for (let i = 0; i < 2; i++) {
        const etiqueta = i === 0 ? "ORIGINAL" : "COPIA";
        const yBase = 10 + 145 * i;

        // Borde recibo
        doc.setDrawColor(180);
        doc.rect(18, yBase, 170, 130, "S");

        // Mácula (lado izquierdo, zona de control)
        doc.setFillColor(60, 70, 125); // tono azul/gris
        doc.rect(10, yBase, 8, 130, "F");

        // Línea discontinua vertical para corte
        doc.setLineDashPattern([2.2, 2.2], 0);
        doc.setDrawColor(100);
        doc.line(18, yBase, 18, yBase + 130);

        doc.setLineDashPattern([], 0);

        // LOGO
        if (logoDataURL) {
          doc.addImage(logoDataURL, "PNG", 22, yBase+3, 16, 16);
        }
        doc.setFontSize(16);
        doc.setTextColor(33,33,33);
        doc.text("Excursiones ABC", 42, yBase+11);
        doc.setFontSize(9);
        doc.text("Av. Principal 123, Ciudad", 42, yBase+16);
        doc.text("Tel: 555-123-4567    info@excursionesabc.com", 42, yBase+20);

        // Recibo N° y fecha
        doc.setFontSize(12);
        doc.setTextColor(0,0,180);
        doc.text(`Recibo N°: ${siguienteNumeroRecibo(actualSeq+idx)}`, 155, yBase+11);
        doc.setTextColor(100,100,100);
        doc.text(`Fecha emisión: ${fechaEmision}`, 155, yBase+16);

        // Etiqueta ORIGINAL/COPIA
        doc.setFontSize(10);
        doc.setTextColor(80,80,80);
        doc.text(`(${etiqueta})`, 178, yBase+24, { align: "right", maxWidth: 22 });

        // Línea horizontal
        doc.setDrawColor(210);
        doc.line(22, yBase + 27, 188, yBase + 27);

        // Detalles asiento y excursión
        doc.setFontSize(11);
        doc.setTextColor(40,40,40);
        doc.text(`Asiento: ${seatNum}`, 24, yBase + 34);
        doc.text(`Excursión: ${excursionInfo?.name || ""}`, 24, yBase+40);
        if (excursionInfo?.date) doc.text(`Fecha exc.: ${formatFecha(excursionInfo.date)}`, 24, yBase+46);
        if (excursionInfo?.place) doc.text(`Salida: ${excursionInfo.place}`, 24, yBase+52);

        // Línea para anotar nombre manualmente
        doc.setDrawColor(150,150,170);
        doc.setLineDashPattern([1,1], 1.5);
        doc.line(60, yBase+63, 180, yBase+63);
        doc.setLineDashPattern([],0);
        doc.setFontSize(11);
        doc.setTextColor(50,50,50);
        doc.text("Nombre del viajero (escribir a mano):", 24, yBase+61);

        // Si hay pasajero, lo muestra a la derecha como referencia pequeña
        if(p){
          doc.setFontSize(9);
          doc.setTextColor(80,80,80);
          doc.text(`Registrado: ${p.name} ${p.surname}`, 120, yBase+34);
        }

        // Tabla de monto y pago
        autoTable(doc, {
          theme: "striped",
          styles: { cellPadding: 2, fontSize: 12, halign: "center" },
          margin: { left: 55 },
          startY: yBase+75,
          head: [["MONTO (€)", "Forma de pago"]],
          body: [[String(""), ""]],
          tableWidth: 75,
        });

        // Marca de agua PAGADO
        // @ts-ignore
        if (typeof doc.saveGraphicsState === "function" && typeof doc.setGState === "function") {
          // @ts-ignore
          doc.saveGraphicsState();
          doc.setTextColor(120, 120, 120);
          doc.setFontSize(38);
          // @ts-ignore
          doc.setGState(new doc.GState({ opacity: 0.25 }));
          doc.text("PAGADO", 103, yBase+105, { align: "center", angle: 0 });
          // @ts-ignore
          doc.restoreGraphicsState();
        } else {
          doc.setTextColor(180, 180, 180);
          doc.setFontSize(38);
          doc.text("PAGADO", 103, yBase+105, { align: "center", angle: 0 });
        }
      }
      if (idx !== seatRange.length - 1) doc.addPage();
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
              Se generarán recibos para <b>todos los asientos del bus</b>. Si el asiento está vacío podrás escribir el nombre del viajero a mano. Cada recibo incluye mácula (control) en el lateral, línea de corte vertical y espacio para nombre manual.
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
