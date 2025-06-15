
import { Passenger } from "./BusSeatMap";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { toast } from "sonner";
import { Bus } from "lucide-react";
import type { ExcursionData } from "@/pages/Index";
import { BusSeatMapPrint } from "./BusSeatMapPrint";
import { getAssociationConfig } from "@/utils/associationConfig";

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
        className="hidden print:flex print:flex-col print:w-full print:h-full print:items-stretch print:justify-between print:p-0 print:m-0"
      >
        {/* Cabecera Asociación (solo impresión) */}
        <div className="print:flex items-center gap-4 print:gap-5 pb-2 border-b border-gray-300 print:px-4 print:pt-3 print:pb-2 print:w-full">
          {association.logo && (
            <img
              src={association.logo}
              alt="Logo Asociación"
              className="h-14 w-14 object-cover rounded-full border border-gray-300 mr-3"
              style={{ minWidth: 56 }}
            />
          )}
          <div className="flex flex-col">
            <span className="text-2xl print:text-2xl font-bold text-primary mb-1">
              {association.name || "Asociación"}
            </span>
            <span className="text-base print:text-base text-gray-800">
              {association.address}
            </span>
            <span className="text-base print:text-base text-gray-800">
              Tel: {association.phone}
            </span>
          </div>
        </div>
        <div className="print:flex print:flex-row print:w-full print:h-full print:items-stretch print:justify-between print:p-0 print:m-0">
          {/* Croquis lado izquierdo en proporción más angosta */}
          <div className="print:w-[30%] print:max-w-[28mm] print:p-1 print:border-r print:border-gray-400 flex items-start print:items-start print:justify-center">
            <BusSeatMapPrint passengers={passengers} />
          </div>
          {/* Lista lado derecho (más ancho para tabla) */}
          <div className="print:w-[70%] print:min-w-[140mm] print:p-4 flex flex-col justify-start items-start print:overflow-hidden">
            <div>
              <h2 className="text-3xl font-bold mb-1 print:text-4xl">{excursionTitle}</h2>
              <div className="text-lg font-semibold mb-2 print:text-2xl">
                {fecha && <span>Fecha: {fecha}{"  "}</span>}
                {hora && <span>Hora: {hora}{"  "}</span>}
                {lugar && <span>Salida: {lugar}</span>}
              </div>
            </div>
            <PasajerosTableImprimir passengers={passengers} />
          </div>
        </div>
      </div>
      {/* Estilos para impresión ajustados a vertical */}
      <style>
        {`
        @media print {
          html, body, #root {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            min-width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            overflow: hidden !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:flex { display: flex !important; }
          .print\\:w-\\[30\\%\\] { width: 30% !important; }
          .print\\:max-w-\\[28mm\\] { max-width: 28mm !important; }
          .print\\:w-\\[70\\%\\] { width: 70% !important; }
          .print\\:min-w-\\[140mm\\] { min-width: 140mm !important; }
          .print\\:p-1 { padding: 0.25rem !important; }
          .print\\:p-4 { padding: 1rem !important; }
          .print\\:border-r { border-right: 2px solid #ccc !important; }
          .print\\:mx-auto { margin-left: auto !important; margin-right: auto !important; }
          .print\\:scale-\\[0\\.7\\] { transform: scale(0.7); }
          .print\\:text-4xl { font-size: 2.2rem !important; }
          .print\\:text-2xl { font-size: 1.3rem !important; }
          .print\\:text-lg { font-size: 1.06rem !important; }
          .print\\:cabecera-asociacion {
            display: flex !important;
            align-items: center !important;
            gap: 20px !important;
            margin-bottom: 8px !important;
            border-bottom: 1.5px solid #ccc !important;
            padding-bottom: 8px !important;
          }
          /* Ocultar botones en impresión */
          .print\\:hidden-imprimir, .print\\:hidden-imprimir * {
            display: none !important;
          }
        }
        `}
      </style>
    </>
  );
}

// El archivo está creciendo demasiado, considera pedir una refactorización al finalizar otros cambios.
