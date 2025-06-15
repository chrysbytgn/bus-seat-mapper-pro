
import { Passenger } from "./BusSeatMap";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { toast } from "sonner";
import { Bus } from "lucide-react";

/**
 * Helper: crea una tabla de pasajeros con asientos ordenados
 */
function PasajerosTableImprimir({ passengers }: { passengers: Passenger[] }) {
  return (
    <table className="w-full text-lg print:text-2xl">
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
            <td colSpan={3} className="py-4 text-center text-gray-400 print:text-black">Ningún pasajero ingresado</td>
          </tr>
        ) : (
          passengers
            .sort((a, b) => a.seat - b.seat)
            .map((p) => (
              <tr key={p.seat}>
                <td className="px-3 py-2 font-semibold text-2xl print:text-3xl">{p.seat}</td>
                <td className="px-3 py-2 text-xl print:text-2xl">{p.name}</td>
                <td className="px-3 py-2 text-xl print:text-2xl">{p.surname}</td>
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
}

export function PassengerList({ passengers }: PassengerListProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    toast("Imprimiendo informe...");
  };

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
          {/* Solo dejar el botón de imprimir */}
          <Button size="sm" onClick={handlePrint}>
            Imprimir
          </Button>
        </div>
      </div>

      {/* Solo se muestra al imprimir */}
      <div
        ref={printRef}
        className="hidden print:flex print:flex-row print:w-full print:h-full print:items-stretch print:justify-stretch print:p-0 print:m-0"
      >
        {/* Croquis lado izquierdo reducido */}
        <div className="print:w-2/5 print:p-2 print:border-r print:border-gray-400 flex items-start print:items-start">
          <div id="croquis-bus-seatmap-print"
               className="w-full print:w-[95%] print:max-w-[260px] print:mx-auto print:my-2 print:scale-90 print:overflow-hidden">
            <span className="block text-center text-2xl print:text-3xl font-extrabold">Croquis del Bus</span>
            <span className="text-lg print:text-lg block mt-2 mb-2 text-center">↓ Croquis reducido</span>
            {/* Aquí iría el render de croquis real si estuviera implementado para impresión */}
            {/* Se mantiene texto visual */}
            <div className="w-full h-52 bg-gray-200 border-2 border-gray-400 rounded-xl flex flex-col items-center justify-center">
              <Bus size={48} className="text-primary" />
              <span className="mt-1 text-base font-medium print:text-lg text-gray-700">Aquí el croquis del bus</span>
            </div>
          </div>
        </div>
        {/* Lista lado derecho */}
        <div className="print:w-3/5 print:p-4 flex flex-col justify-start print:justify-start">
          <h2 className="text-3xl font-bold mb-6 text-left print:text-4xl print:mb-8">Lista de pasajeros</h2>
          <PasajerosTableImprimir passengers={passengers} />
        </div>
      </div>
      {/* Estilos para impresión ajustados */}
      <style>
        {`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #root {
            width: 100vw !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:flex { display: flex !important; }
          .print\\:w-2\\/5 { width: 40% !important; }
          .print\\:w-3\\/5 { width: 60% !important; }
          .print\\:p-2 { padding: 0.5rem !important; }
          .print\\:p-4 { padding: 1rem !important; }
          .print\\:border-r { border-right: 2px solid #ccc !important; }
          .print\\:items-stretch { align-items: stretch !important; }
          .print\\:justify-stretch { justify-content: stretch !important; }
          .print\\:text-4xl { font-size: 2.3rem !important; }
          .print\\:text-3xl { font-size: 1.8rem !important; }
          .print\\:text-2xl { font-size: 1.3rem !important; }
          .print\\:mb-8 { margin-bottom: 2.5rem !important; }
          .print\\:max-w-full { max-width: 100% !important; }
          .print\\:max-w-[260px] { max-width: 260px !important; }
          .print\\:mx-auto { margin-left: auto !important; margin-right: auto !important; }
          .print\\:my-2 { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }
          .print\\:scale-90 { transform: scale(0.90); }
          /* Mejorar tamaño de letra en la tabla */
          table, th, td {
            font-size: 1.35em !important;
            padding: 0.30em !important;
            color: #111 !important;
          }
          /* Forzar todo en una hoja */
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          html, body {
            width: 100vw !important;
            height: 100vh !important;
            overflow: hidden !important;
          }
        }
        `}
      </style>
    </>
  );
}

