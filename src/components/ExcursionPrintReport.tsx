
import React from "react";
import { Passenger } from "./BusSeatMap";
import { BusSeatMapPrint } from "./BusSeatMapPrint";
import { getAssociationConfig } from "@/utils/associationConfig";
import type { ExcursionData } from "@/pages/Index";

const ALL_SEATS = Array.from({ length: 55 }, (_, i) => i + 1);

/**
 * Tabla optimizada para personas mayores: fuente más grande, mejor contraste
 */
function PasajerosTableImprimir({ passengers }: { passengers: Passenger[] }) {
  return (
    <table className="w-full text-[12px] print:text-[11px] border-separate border-spacing-y-[1px]">
      <thead>
        <tr className="bg-gray-100">
          <th className="text-left px-2 py-1 font-semibold w-[25px] border-b border-gray-300">#</th>
          <th className="text-left px-2 py-1 font-semibold min-w-[120px] border-b border-gray-300">Nombre completo</th>
          <th className="text-left px-2 py-1 font-semibold min-w-[60px] border-b border-gray-300">Documento</th>
        </tr>
      </thead>
      <tbody>
        {ALL_SEATS.map(seatNum => {
          const p = passengers.find(pass => pass.seat === seatNum);
          return (
            <tr key={seatNum} className="hover:bg-gray-50">
              <td className="px-2 py-1 font-bold text-center border-b border-gray-100">{seatNum}</td>
              <td className="px-2 py-1 border-b border-gray-100">
                {p
                  ? `${p.name} ${p.surname}`.trim()
                  : <span className="italic text-gray-400 print:text-gray-600">(vacío)</span>
                }
              </td>
              <td className="px-2 py-1 border-b border-gray-100">{/* Documento: campo vacío para rellenar */}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ExcursionPrintReport({
  passengers,
  excursionInfo,
}: {
  passengers: Passenger[];
  excursionInfo?: ExcursionData | null;
}) {
  const association = getAssociationConfig();
  const excursionTitle = excursionInfo?.name || "Excursión";
  const fecha = excursionInfo?.date
    ? new Date(excursionInfo.date).toLocaleDateString()
    : "";
  const hora = excursionInfo?.time || "";
  const lugar = excursionInfo?.place || "";

  return (
    <div className="print:w-full print:h-full print:p-0 print:m-0 bg-white print:text-black">
      {/* CABECERA COMPACTA */}
      <div className="flex items-center gap-3 mb-3 border-b-2 border-gray-400 print:pt-3 print:pb-2 print:px-4 print:w-full">
        {association.logo && (
          <img
            src={association.logo}
            alt="Logo Asociación"
            className="h-12 w-12 object-cover rounded-full border border-gray-300"
            style={{ minWidth: 48 }}
          />
        )}
        <div className="flex flex-col">
          <span className="text-[18px] print:text-[16px] font-bold text-black mb-1">
            {association.name || "Asociación"}
          </span>
          {association.address && (
            <span className="text-[12px] print:text-[11px] text-gray-700">{association.address}</span>
          )}
          {association.phone && (
            <span className="text-[12px] print:text-[11px] text-gray-700">
              Tel: {association.phone}
            </span>
          )}
        </div>
      </div>
      
      {/* LAYOUT HORIZONTAL: CROQUIS IZQUIERDA + LISTA DERECHA */}
      <div className="flex flex-row gap-4 print:px-4 w-full items-start">
        
        {/* CROQUIS BUS - LADO IZQUIERDO FIJO */}
        <div className="flex flex-col items-center print:w-[200px] flex-shrink-0">
          <BusSeatMapPrint passengers={passengers} />
        </div>
        
        {/* INFORMACIÓN Y LISTA - LADO DERECHO */}
        <div className="flex flex-col flex-1 min-w-0">
          
          {/* Info de la excursión */}
          <div className="mb-3">
            <h2 className="text-[16px] font-bold print:text-[15px] mb-2 text-black">{excursionTitle}</h2>
            
            <div className="grid grid-cols-2 gap-2 text-[13px]  print:text-[12px] font-semibold text-gray-800">
              {fecha && <div>Fecha: {fecha}</div>}
              {hora && <div>Hora: {hora}</div>}
              {lugar && <div className="col-span-2">Salida: {lugar}</div>}
            </div>
          </div>
          
          {/* LISTA DE PASAJEROS - Fuente legible para mayores */}
          <div className="w-full print:pr-0 max-w-full overflow-hidden">
            <h3 className="text-[14px] print:text-[13px] font-bold mb-2 text-black">Lista de Pasajeros</h3>
            <PasajerosTableImprimir passengers={passengers} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
