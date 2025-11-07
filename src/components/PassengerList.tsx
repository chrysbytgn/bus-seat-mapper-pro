
import { Passenger } from "./BusSeatMap";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { toast } from "sonner";
import { Bus } from "lucide-react";
import type { ExcursionData } from "@/pages/Index";
import { BusSeatMapPrint } from "./BusSeatMapPrint";
import { getAssociationConfig } from "@/utils/associationConfig";
import { ExcursionPrintReport } from "./ExcursionPrintReport";
import { getStopColor } from "@/utils/stopColors";

// Ayuda: asientos del 1 al 55
const ALL_SEATS = Array.from({ length: 55 }, (_, i) => i + 1);

/**
 * Helper: crea una tabla de 55 asientos y nombres
 */
function PasajerosTableImprimir({ passengers }: { passengers: Passenger[] }) {
  return (
    <table className="w-full text-xl print:text-lg">
      <thead>
        <tr>
          <th className="text-left px-3 py-2 print:px-4 print:py-2">#</th>
          <th className="text-left px-3 py-2 print:px-4 print:py-2">Nombre</th>
          <th className="text-left px-3 py-2 print:px-4 print:py-2">Apellido</th>
        </tr>
      </thead>
      <tbody>
        {ALL_SEATS.map(seatNum => {
          const p = passengers.find(pass => pass.seat === seatNum);
          return (
            <tr key={seatNum}>
              <td className="px-3 py-2 font-bold text-2xl print:text-lg">{seatNum}</td>
              <td className="px-3 py-2 text-xl print:text-lg">{p ? p.name : <span className="italic text-gray-400 print:text-gray-700">(vacío)</span>}</td>
              <td className="px-3 py-2 text-xl print:text-lg">{p ? p.surname : ""}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface PassengerListProps {
  passengers: Passenger[];
  onClear: () => void;
  excursionInfo?: ExcursionData | null;
}

export function PassengerList({ passengers, excursionInfo }: PassengerListProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    toast("Imprimiendo informe...");
  };

  // Preparar datos de cabecera
  const association = getAssociationConfig();
  const excursionTitle = excursionInfo?.name || "Excursión";
  const fecha = excursionInfo?.date
    ? new Date(excursionInfo.date).toLocaleDateString()
    : "";
  const hora = excursionInfo?.time || "";
  const lugar = excursionInfo?.place || "";

  return (
    <>
      {/* Vista normal */}
      <div className="print:hidden">
        <div className="flex items-center gap-2 mb-4">
          <Bus className="text-primary" size={28} />
          <h2 className="text-xl font-bold">Lista de pasajeros</h2>
        </div>
        <div className="bg-white border rounded-lg shadow p-4 mb-2 max-h-[540px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-2 py-1 w-8">Parada</th>
                <th className="text-left px-2 py-1"># Asiento</th>
                <th className="text-left px-2 py-1">Nombre</th>
                <th className="text-left px-2 py-1">Apellido</th>
                <th className="text-left px-2 py-1">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {passengers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">Ningún pasajero ingresado</td>
                </tr>
              ) : (
                passengers
                  .sort((a, b) => a.seat - b.seat)
                  .map(p => (
                    <tr key={p.seat}>
                      <td className="px-2 py-1">
                        {p.stop_name && (
                          <div 
                            className="w-3 h-3 rounded-full inline-block"
                            style={{ backgroundColor: getStopColor(p.stop_name) }}
                            title={p.stop_name}
                          />
                        )}
                      </td>
                      <td className="px-2 py-1 font-semibold">{p.seat}</td>
                      <td className="px-2 py-1">{p.name}</td>
                      <td className="px-2 py-1">{p.surname}</td>
                      <td className="px-2 py-1 text-gray-600">{p.phone || "-"}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" onClick={handlePrint}>
            Imprimir
          </Button>
        </div>
      </div>
    </>
  );
}
