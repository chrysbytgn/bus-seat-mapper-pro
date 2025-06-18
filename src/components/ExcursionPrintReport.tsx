
import React from "react";
import { Passenger } from "./BusSeatMap";
import { BusSeatMapPrint } from "./BusSeatMapPrint";
import { getAssociationConfig } from "@/utils/associationConfig";
import type { ExcursionData } from "@/pages/Index";

const ALL_SEATS = Array.from({ length: 55 }, (_, i) => i + 1);

/**
 * Tabla compacta optimizada para imprimir 55 asientos en una página
 */
function PasajerosTableImprimir({ passengers }: { passengers: Passenger[] }) {
  // Dividir los asientos en dos columnas para mejor aprovechamiento del espacio
  const leftColumnSeats = ALL_SEATS.slice(0, 28); // 1-28
  const rightColumnSeats = ALL_SEATS.slice(28); // 29-55

  return (
    <div className="grid grid-cols-2 gap-2 w-full text-[10px] print:text-[9px]">
      {/* Columna izquierda */}
      <table className="w-full border-separate border-spacing-y-[1px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-1 py-1 font-semibold w-[20px] border-b border-gray-300 text-[9px]">#</th>
            <th className="text-left px-1 py-1 font-semibold border-b border-gray-300 text-[9px]">Nombre completo</th>
          </tr>
        </thead>
        <tbody>
          {leftColumnSeats.map(seatNum => {
            const p = passengers.find(pass => pass.seat === seatNum);
            return (
              <tr key={seatNum}>
                <td className="px-1 py-[2px] font-bold text-center border-b border-gray-100 text-[9px]">{seatNum}</td>
                <td className="px-1 py-[2px] border-b border-gray-100 text-[9px]">
                  {p
                    ? `${p.name} ${p.surname}`.trim()
                    : <span className="italic text-gray-400 print:text-gray-600">(vacío)</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Columna derecha */}
      <table className="w-full border-separate border-spacing-y-[1px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-1 py-1 font-semibold w-[20px] border-b border-gray-300 text-[9px]">#</th>
            <th className="text-left px-1 py-1 font-semibold border-b border-gray-300 text-[9px]">Nombre completo</th>
          </tr>
        </thead>
        <tbody>
          {rightColumnSeats.map(seatNum => {
            const p = passengers.find(pass => pass.seat === seatNum);
            return (
              <tr key={seatNum}>
                <td className="px-1 py-[2px] font-bold text-center border-b border-gray-100 text-[9px]">{seatNum}</td>
                <td className="px-1 py-[2px] border-b border-gray-100 text-[9px]">
                  {p
                    ? `${p.name} ${p.surname}`.trim()
                    : <span className="italic text-gray-400 print:text-gray-600">(vacío)</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
    <div className="print:w-full print:h-full print:p-0 print:m-0 bg-white print:text-black print:page-break-inside-avoid">
      {/* CABECERA COMPACTA */}
      <div className="flex items-center gap-2 mb-2 border-b-2 border-gray-400 print:pt-2 print:pb-1 print:px-3 print:w-full">
        {association.logo && (
          <img
            src={association.logo}
            alt="Logo Asociación"
            className="h-10 w-10 object-cover rounded-full border border-gray-300"
            style={{ minWidth: 40 }}
          />
        )}
        <div className="flex flex-col">
          <span className="text-[14px] print:text-[13px] font-bold text-black mb-1">
            {association.name || "Asociación"}
          </span>
          {association.address && (
            <span className="text-[10px] print:text-[9px] text-gray-700">{association.address}</span>
          )}
          {association.phone && (
            <span className="text-[10px] print:text-[9px] text-gray-700">
              Tel: {association.phone}
            </span>
          )}
        </div>
      </div>
      
      {/* LAYOUT OPTIMIZADO PARA UNA PÁGINA */}
      <div className="print:px-3 w-full">
        
        {/* Información de la excursión - COMPACTA */}
        <div className="mb-2">
          <h2 className="text-[14px] font-bold print:text-[13px] mb-1 text-black">{excursionTitle}</h2>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] print:text-[10px] font-semibold text-gray-800">
            {fecha && <div>Fecha: {fecha}</div>}
            {hora && <div>Hora: {hora}</div>}
            {lugar && <div>Salida: {lugar}</div>}
          </div>
        </div>
        
        {/* LAYOUT HORIZONTAL: CROQUIS IZQUIERDA + LISTA DEBAJO */}
        <div className="flex flex-col gap-2 w-full">
          
          {/* CROQUIS BUS - PARTE SUPERIOR IZQUIERDA */}
          <div className="flex justify-start">
            <div className="print:w-[180px] flex-shrink-0">
              <BusSeatMapPrint passengers={passengers} />
            </div>
          </div>
          
          {/* LISTA DE PASAJEROS - DEBAJO DEL CROQUIS */}
          <div className="w-full">
            <h3 className="text-[12px] print:text-[11px] font-bold mb-1 text-black">Lista de Pasajeros (55 asientos)</h3>
            <PasajerosTableImprimir passengers={passengers} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
