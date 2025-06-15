
import React from "react";
import { Passenger } from "./BusSeatMap";
import { BusSeatMapPrint } from "./BusSeatMapPrint";
import { getAssociationConfig } from "@/utils/associationConfig";
import type { ExcursionData } from "@/pages/Index";

const ALL_SEATS = Array.from({ length: 55 }, (_, i) => i + 1);

/**
 * Tabla: nombre y apellido juntos (Nombre completo), columna documento (vacía si no hay).
 * Compacta, fuente pequeña, mínimo padding.
 */
function PasajerosTableImprimir({ passengers }: { passengers: Passenger[] }) {
  return (
    <table className="w-full text-[10px] print:text-[9px] border-separate border-spacing-y-[0.5px]">
      <thead>
        <tr>
          <th className="text-left px-1 py-0.5 font-semibold w-[18px]">#</th>
          <th className="text-left px-1 py-0.5 font-semibold min-w-[78px]">Nombre completo</th>
          <th className="text-left px-1 py-0.5 font-semibold min-w-[40px]">Documento</th>
        </tr>
      </thead>
      <tbody>
        {ALL_SEATS.map(seatNum => {
          const p = passengers.find(pass => pass.seat === seatNum);
          return (
            <tr key={seatNum}>
              <td className="px-1 py-0.5 font-bold">{seatNum}</td>
              <td className="px-1 py-0.5">
                {p
                  ? `${p.name} ${p.surname}`.trim()
                  : <span className="italic text-gray-400 print:text-gray-700">(vacío)</span>
                }
              </td>
              <td className="px-1 py-0.5">{/* Documento: queda vacío si no hay */}</td>
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
  const paradas = Array.isArray(excursionInfo?.stops) && excursionInfo?.stops.length > 0
    ? excursionInfo?.stops
    : [];

  return (
    <div className="print:w-full print:h-full print:p-0 print:m-0 bg-white">
      {/* CABECERA */}
      <div className="flex items-center gap-3 mb-1.5 border-b border-gray-300 print:pt-2 print:pb-1 print:px-4 print:w-full">
        {association.logo && (
          <img
            src={association.logo}
            alt="Logo Asociación"
            className="h-10 w-10 object-cover rounded-full border border-gray-300 mr-2"
            style={{ minWidth: 40 }}
          />
        )}
        <div className="flex flex-col">
          <span className="text-[15px] print:text-[13px] font-bold text-primary mb-0.5">
            {association.name || "Asociación"}
          </span>
          {association.address && (
            <span className="text-[10px] print:text-[10px] text-gray-800">{association.address}</span>
          )}
          {association.phone && (
            <span className="text-[10px] print:text-[10px] text-gray-800">
              Tel: {association.phone}
            </span>
          )}
        </div>
      </div>
      {/* INFORMACIÓN Y LAYOUT */}
      <div className="flex flex-row gap-2 print:px-4 w-full min-h-[85px] print:min-h-[65px] items-start">
        {/* Croquis bus a la izquierda, más pequeño */}
        <div className="flex flex-col items-center print:w-[120px] pl-1 pr-2 flex-shrink-0">
          <BusSeatMapPrint passengers={passengers} />
        </div>
        {/* Info + tabla a la derecha */}
        <div className="flex flex-col flex-1">
          <span className="text-[13px] font-bold print:text-[12px] mb-0.5">{excursionTitle}</span>
          <div className="text-[11px] font-semibold print:text-[10px] mb-0.5">
            {fecha && <span>Fecha: {fecha}{" "}</span>}
            {hora && <span>Hora: {hora}{" "}</span>}
          </div>
          <div className="text-[11px] font-semibold print:text-[10px] mb-0.5">
            {lugar && <span>Salida: {lugar}</span>}
          </div>
          {paradas.length > 0 && (
            <div className="print:mt-0.5 mt-0.5">
              <span className="block font-semibold text-[9px] print:text-[9px] mb-0.5">Paradas adicionales:</span>
              <ul className="list-disc ml-4 text-[9px] print:text-[9px] mb-0.5">
                {paradas.map((stop, idx) =>
                  <li key={idx}>{stop}</li>
                )}
              </ul>
            </div>
          )}
          {/* Tabla lista pasajeros */}
          <div className="w-full print:pr-0 pt-0 max-w-full overflow-x-auto">
            <PasajerosTableImprimir passengers={passengers} />
          </div>
        </div>
      </div>
    </div>
  );
}
