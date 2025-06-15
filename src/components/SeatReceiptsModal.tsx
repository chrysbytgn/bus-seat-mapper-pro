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

    // Configuración de layout 2 columnas x 2 filas = 4 por página
    const recibosPorHoja = 4;
    const colWidth = 100;  // A4 width: 210mm, margen aprox. 5mm a cada lado
    const rowHeight = 145; // Un poco menos de la mitad de A4 height: 297mm

    passengers; // dummy to avoid TS warning if not used elsewhere

    seatRange.forEach((seatNum, idx) => {
      // En qué posición de la hoja va este recibo
      const posInPage = idx % recibosPorHoja;
      const pageIndex = Math.floor(idx / recibosPorHoja);

      // Si es el 1º de la hoja después de la primera, añadir página
      if (posInPage === 0 && idx !== 0) doc.addPage();

      // Cálculo de posición X, Y
      const col = posInPage % 2;
      const row = Math.floor(posInPage / 2);

      // Margen superior/izquierdo
      const left = 7 + col * colWidth;
      const top = 10 + row * (rowHeight - 5);

      const p = getPassenger(seatNum);
      for (let i = 0; i < 2; i++) {
        // i=0 original, i=1 copia (la copia debajo de la original, pequeña separación vertical)
        const yBase = top + i * 62; // Separadas vertical por 62mm, caben 2
        const etiqueta = i === 0 ? "ORIGINAL" : "COPIA";

        // Borde recibo
        doc.setDrawColor(180);
        doc.rect(left + 8, yBase, 83, 58, "S");

        // Mácula (lado izquierdo, zona de control)
        doc.setFillColor(60, 70, 125);
        doc.rect(left, yBase, 8, 58, "F");

        // Línea discontinua vertical para corte
        doc.setLineDashPattern([2.2, 2.2], 0);
        doc.setDrawColor(100);
        doc.line(left + 8, yBase, left + 8, yBase + 58);
        doc.setLineDashPattern([], 0);

        // LOGO
        if (logoDataURL) {
          doc.addImage(logoDataURL, "PNG", left + 10, yBase + 3, 11, 11);
        }
        doc.setFontSize(9.5);
        doc.setTextColor(33,33,33);
        doc.text("Excursiones ABC", left + 23, yBase + 9);
        doc.setFontSize(6.5);
        doc.text("Av. Principal 123, Ciudad", left + 23, yBase + 13);
        doc.text("Tel: 555-123-4567    info@excursionesabc.com", left + 23, yBase + 16.5);

        // Recibo N° y fecha
        doc.setFontSize(7);
        doc.setTextColor(0,0,180);
        doc.text(`Recibo N°: ${siguienteNumeroRecibo(actualSeq+idx)}`, left + 80, yBase + 9);
        doc.setTextColor(100,100,100);
        doc.text(`Fecha emisión: ${fechaEmision}`, left + 80, yBase + 13);

        // Etiqueta ORIGINAL/COPIA
        doc.setFontSize(6.5);
        doc.setTextColor(80,80,80);
        doc.text(`(${etiqueta})`, left + 88, yBase + 15.5, { align: "right", maxWidth: 15 });

        // Línea horizontal
        doc.setDrawColor(210);
        doc.line(left + 10, yBase + 18.5, left + 89, yBase + 18.5);

        // Detalles asiento y excursión
        doc.setFontSize(7.5);
        doc.setTextColor(40,40,40);
        doc.text(`Asiento: ${seatNum}`, left + 11, yBase + 23);
        doc.text(`Excursión: ${excursionInfo?.name || ""}`, left + 11, yBase + 27);
        if (excursionInfo?.date) doc.text(`Fecha exc.: ${formatFecha(excursionInfo.date)}`, left + 11, yBase + 31);
        if (excursionInfo?.place) doc.text(`Salida: ${excursionInfo.place}`, left + 11, yBase + 35);

        // Línea para anotar nombre manualmente
        doc.setDrawColor(150,150,170);
        doc.setLineDashPattern([1,1], 1.2);
        doc.line(left + 35, yBase + 42, left + 86, yBase + 42);
        doc.setLineDashPattern([],0);
        doc.setFontSize(7.5);
        doc.setTextColor(50,50,50);
        doc.text("Nombre del viajero (escribir a mano):", left + 11, yBase + 40);

        // Si hay pasajero, lo muestra a la derecha como referencia pequeña
        if(p){
          doc.setFontSize(6.2);
          doc.setTextColor(80,80,80);
          doc.text(`Registrado: ${p.name} ${p.surname}`, left + 38, yBase + 23);
        }

        // Tabla de monto y pago (simulada a mano)
        doc.setFontSize(7.2);
        doc.setTextColor(0,0,0);
        doc.setDrawColor(180);
        // Encabezado
        doc.rect(left + 35, yBase + 44, 37, 7, "S");
        doc.text("MONTO (€)", left + 37, yBase + 49);
        doc.line(left + 55, yBase + 44, left + 55, yBase + 51);
        doc.text("Forma de pago", left + 57, yBase + 49);
        // Celdas vacías
        doc.rect(left + 35, yBase + 51, 37, 6, "S");

        // Marca de agua PAGADO (más pequeña)
        // @ts-ignore
        if (typeof doc.saveGraphicsState === "function" && typeof doc.setGState === "function") {
          // @ts-ignore
          doc.saveGraphicsState();
          doc.setTextColor(120, 120, 120);
          doc.setFontSize(17);
          // @ts-ignore
          doc.setGState(new doc.GState({ opacity: 0.23 }));
          doc.text("PAGADO", left + 49, yBase + 58, { align: "center", angle: 0 });
          // @ts-ignore
          doc.restoreGraphicsState();
        } else {
          doc.setTextColor(180, 180, 180);
          doc.setFontSize(17);
          doc.text("PAGADO", left + 49, yBase + 58, { align: "center", angle: 0 });
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
