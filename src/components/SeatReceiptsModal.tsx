
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generarPDFasientos } from "./SeatReceiptsPDF";
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

  const handlePDF = () =>
    generarPDFasientos(seatRange, passengers, excursionInfo, setGenerating);

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
          <Button disabled={generating} onClick={handlePDF}>{generating ? "Generando..." : "Descargar PDF (todos los asientos)"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
