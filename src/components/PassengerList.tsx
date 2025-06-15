import { Passenger } from "./BusSeatMap";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { toast } from "sonner";
import { Bus } from "lucide-react";
import type { ExcursionData } from "@/pages/Index";

type PrintExcursionData = ExcursionData | null;

/**
 * Helper: crea una tabla de pasajeros con asientos ordenados y letras grandes para imprimir.
 */
function PasajerosTableImprimir({ passengers }: { passengers: Passenger[] }) {
  return (
    <table className="w-full text-xl print:text-2xl">
      <thead>
        <tr>
          <th className="text-left px-3 py-2 print:px-6 print:py-3">#</th>
          <th className="text-left px-3 py-2 print:px-6 print:py-3">Nombre</th>
          <th className="text-left px-3 py-2 print:px-6 print:py-3">Apellido</th>
        </tr>
      </thead>
      <tbody>
        {passengers.length === 0 ? (
          <tr>
            <td colSpan={3} className="py-4 text-center text-gray-400 print:text-black text-lg print:text-2xl">Ningún pasajero ingresado</td>
          </tr>
        ) : (
          passengers
            .sort((a, b) => a.seat - b.seat)
            .map((p) => (
              <tr key={p.seat}>
                <td className="px-3 py-2 font-bold text-3xl print:text-4xl">{p.seat}</td>
                <td className="px-3 py-2 text-2xl print:text-3xl">{p.name}</td>
                <td className="px-3 py-2 text-2xl print:text-3xl">{p.surname}</td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  );
}

interface PassengerListProps {
  passengers: Passenger[];
  onClear: () => void;
  excursionInfo?: PrintExcursionData;
}

export function PassengerList({ passengers, excursionInfo }: PassengerListProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    toast("Imprimiendo informe...");
  };

  // Preparar datos de cabecera
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
                <th className="text-left px-2 py-1"># Asiento</th>
                <th className="text-left px-2 py-1">Nombre</th>
                <th className="text-left px-2 py-1">Apellido</th>
              </tr>
            </thead>
            <tbody>
              {passengers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-400">Ningún pasajero ingresado</td>
                </tr>
              ) : (
                passengers
                  .sort((a, b) => a.seat - b.seat)
                  .map(p => (
                    <tr key={p.seat}>
                      <td className="px-2 py-1 font-semibold">{p.seat}</td>
                      <td className="px-2 py-1">{p.name}</td>
                      <td className="px-2 py-1">{p.surname}</td>
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
      {/* IMPRESIÓN */}
      <div
        ref={printRef}
        className="hidden print:flex print:flex-row print:w-full print:h-full print:items-stretch print:justify-between print:p-0 print:m-0"
      >
        {/* Croquis lado izquierdo (miniatura mucho más pequeña para imprimir) */}
        <div className="print:w-[15%] print:p-1 print:border-r print:border-gray-400 flex items-start print:items-start print:justify-center">
          <div
            id="croquis-bus-seatmap-print"
            className="w-[60px] h-[80px] print:w-[60px] print:h-[80px] print:mx-auto print:my-2 print:scale-[0.55] print:overflow-hidden flex flex-col items-center"
          >
            <span className="block text-center text-[13px] print:text-xs font-bold mb-0">Croquis Bus</span>
            <div className="w-full h-full bg-gray-200 border-2 border-gray-400 rounded-xl flex flex-col items-center justify-center">
              <Bus size={18} className="text-primary print:text-black" />
              <span className="mt-0.5 text-[9px] font-medium print:text-xs text-gray-700">[croquis]</span>
            </div>
          </div>
        </div>
        {/* Lista lado derecho */}
        <div className="print:w-[85%] print:p-5 flex flex-col justify-start items-start print:overflow-hidden">
          <div>
            <h2 className="text-4xl font-bold mb-2 print:text-5xl">{excursionTitle}</h2>
            <div className="text-2xl font-semibold mb-3 print:text-3xl">
              {fecha && <span>Fecha: {fecha}{"  "}</span>}
              {hora && <span>Hora: {hora}{"  "}</span>}
              {lugar && <span>Salida: {lugar}</span>}
            </div>
          </div>
          <PasajerosTableImprimir passengers={passengers} />
        </div>
      </div>
      {/* Estilos para impresión ajustados */}
      <style>
        {`
        @media print {
          html, body, #root {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100vw !important;
            min-width: 0 !important;
            overflow: hidden !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:flex { display: flex !important; }
          .print\\:w-[15\\%] { width: 15% !important; }
          .print\\:w-[85\\%] { width: 85% !important; }
          .print\\:p-1 { padding: 0.25rem !important; }
          .print\\:p-5 { padding: 1.5rem !important; }
          .print\\:border-r { border-right: 2px solid #ccc !important; }
          .print\\:items-stretch { align-items: stretch !important; }
          .print\\:mx-auto { margin-left: auto !important; margin-right: auto !important; }
          .print\\:scale-[0.55] { transform: scale(0.55); }
          .print\\:text-5xl { font-size: 3rem !important; }
          .print\\:text-4xl { font-size: 2.2rem !important; }
          .print\\:text-3xl { font-size: 1.5rem !important; }
          table, th, td {
            font-size: 1.6em !important;
            padding: 0.35em !important;
            color: #111 !important;
          }
          th {
            font-weight: bold;
          }
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
        }
        `}
      </style>
    </>
  );
}
