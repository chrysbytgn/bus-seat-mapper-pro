
import React from "react";
import { Passenger } from "./BusSeatMap";
import { BusSeatMapPrint } from "./BusSeatMapPrint";
import { getAssociationConfig } from "@/utils/associationConfig";
import type { ExcursionData } from "@/pages/Index";
import { getStopColor } from "@/utils/stopColors";

/**
 * Tabla compacta optimizada para imprimir asientos en una página
 */
function PasajerosTableImprimir({ passengers, availableSeats = 55 }: { passengers: Passenger[], availableSeats?: number }) {
  const ALL_SEATS = Array.from({ length: availableSeats }, (_, i) => i + 1);
  // Agrupar asientos en filas para mejor presentación
  const midpoint = Math.ceil(availableSeats / 2);
  const leftColumnSeats = ALL_SEATS.slice(0, midpoint);
  const rightColumnSeats = ALL_SEATS.slice(midpoint);

  return (
    <div className="grid grid-cols-2 gap-4 w-full text-[14px] print:text-[14px]">
      {/* Columna izquierda */}
      <table className="w-full border-separate border-spacing-y-[2px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-2 py-2 font-semibold w-[25px] border-b border-gray-300 text-[15px] print:text-[14px]">#</th>
            <th className="text-left px-2 py-2 font-semibold border-b border-gray-300 text-[15px] print:text-[14px]">Pasajero y Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {leftColumnSeats.map(seatNum => {
            const p = passengers.find(pass => pass.seat === seatNum);
            return (
              <tr key={seatNum}>
                <td className="px-2 py-1 font-bold text-center border-b border-gray-100 text-[14px] print:text-[14px]">{seatNum}</td>
                <td className="px-2 py-1 border-b border-gray-100 text-[14px] print:text-[14px]">
                  {p ? (
                    <div className="flex items-center gap-1">
                      {p.stop_name && (
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getStopColor(p.stop_name) }}
                        />
                      )}
                      <div>
                        <span className="font-medium">{`${p.name} ${p.surname}`.trim()}</span>
                        {p.phone && <span className="text-gray-600 ml-2">({p.phone})</span>}
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-gray-400 print:text-gray-600">(vacío)</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Columna derecha */}
      <table className="w-full border-separate border-spacing-y-[2px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-2 py-2 font-semibold w-[25px] border-b border-gray-300 text-[15px] print:text-[14px]">#</th>
            <th className="text-left px-2 py-2 font-semibold border-b border-gray-300 text-[15px] print:text-[14px]">Pasajero y Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {rightColumnSeats.map(seatNum => {
            const p = passengers.find(pass => pass.seat === seatNum);
            return (
              <tr key={seatNum}>
                <td className="px-2 py-1 font-bold text-center border-b border-gray-100 text-[14px] print:text-[14px]">{seatNum}</td>
                <td className="px-2 py-1 border-b border-gray-100 text-[14px] print:text-[14px]">
                  {p ? (
                    <div className="flex items-center gap-1">
                      {p.stop_name && (
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getStopColor(p.stop_name) }}
                        />
                      )}
                      <div>
                        <span className="font-medium">{`${p.name} ${p.surname}`.trim()}</span>
                        {p.phone && <span className="text-gray-600 ml-2">({p.phone})</span>}
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-gray-400 print:text-gray-600">(vacío)</span>
                  )}
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
  const paradas = excursionInfo?.stops || [];
  const availableSeats = excursionInfo?.available_seats || 55;
  
  // Extraer paradas únicas de los pasajeros
  const uniqueStops = Array.from(
    new Set(passengers.filter(p => p.stop_name).map(p => p.stop_name!))
  ).sort();

  return (
    <div className="print:w-full print:h-full print:p-0 print:m-0 bg-white print:text-black print:page-break-inside-avoid">
      {/* CABECERA MEJORADA CON LOGO Y NOMBRE COMPLETO */}
      <div className="flex items-start gap-3 mb-4 border-b-2 border-gray-400 print:pt-3 print:pb-3 print:px-4 print:w-full">
        {association.logo && (
          <img
            src={association.logo}
            alt="Logo Asociación"
            className="h-16 w-16 object-cover rounded-lg border border-gray-300 flex-shrink-0"
            style={{ minWidth: 64, minHeight: 64 }}
          />
        )}
        <div className="flex flex-col flex-1">
          <span className="text-[20px] print:text-[18px] font-bold text-black mb-2 leading-tight">
            {association.name || "Asociación"}
          </span>
          {association.address && (
            <span className="text-[15px] print:text-[14px] text-gray-700 mb-1">{association.address}</span>
          )}
          {association.phone && (
            <span className="text-[15px] print:text-[14px] text-gray-700">
              Tel: {association.phone}
            </span>
          )}
        </div>
      </div>
      
      {/* LAYOUT PARA UNA PÁGINA CON CROQUIS A LA IZQUIERDA Y NOMBRES AL LADO */}
      <div className="print:px-4 w-full">
        
        {/* Información de la excursión - COMPACTA */}
        <div className="mb-4">
          <h2 className="text-[18px] font-bold print:text-[16px] mb-2 text-black">{excursionTitle}</h2>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[15px] print:text-[14px] font-semibold text-gray-800">
            {fecha && <div>Fecha: {fecha}</div>}
            {hora && <div>Hora: {hora}</div>}
            {lugar && <div>Salida: {lugar}</div>}
          </div>
          
          {/* Paradas adicionales */}
          {paradas && paradas.length > 0 && (
            <div className="mt-2">
              <div className="text-[14px] print:text-[13px] text-gray-700">
                <strong>Paradas:</strong> {paradas.join(" → ")}
              </div>
            </div>
          )}
        </div>
        
        {/* LAYOUT HORIZONTAL: CROQUIS IZQUIERDA + LISTA AL LADO */}
        <div className="flex gap-4 w-full items-start">
          
          {/* CROQUIS BUS - PARTE IZQUIERDA - MEJORADO */}
          <div className="flex-shrink-0">
            <div className="print:w-[220px] w-[220px]">
              <BusSeatMapPrint passengers={passengers} availableSeats={availableSeats} />
              
              {/* Leyenda de colores de paradas debajo del croquis */}
              {uniqueStops.length > 0 && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                  <strong className="text-[11px] print:text-[10px]">Paradas:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {uniqueStops.map(stop => (
                      <div key={stop} className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getStopColor(stop) }}
                        />
                        <span className="text-[10px] print:text-[9px]">{stop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* LISTA DE PASAJEROS - AL LADO DEL CROQUIS CON TELÉFONOS */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] print:text-[15px] font-bold mb-3 text-black">Lista de Pasajeros ({availableSeats} asientos)</h3>
            <PasajerosTableImprimir passengers={passengers} availableSeats={availableSeats} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
