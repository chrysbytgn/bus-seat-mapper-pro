
import React from "react";
import { Passenger } from "./BusSeatMap";
import { BusSeatMapPrint } from "./BusSeatMapPrint";
import { getAssociationConfig } from "@/utils/associationConfig";
import type { ExcursionData } from "@/pages/Index";

const ALL_SEATS = Array.from({ length: 55 }, (_, i) => i + 1);

function PasajerosTableImprimir({ passengers }: { passengers: Passenger[] }) {
  // Tamaños para que quepa en la hoja
  return (
    <table className="w-full text-base print:text-xs border-separate border-spacing-y-[0.5px]">
      <thead>
        <tr>
          <th className="text-left px-1.5 py-0.5">#</th>
          <th className="text-left px-1.5 py-0.5">Nombre</th>
          <th className="text-left px-1.5 py-0.5">Apellido</th>
        </tr>
      </thead>
      <tbody>
        {ALL_SEATS.map(seatNum => {
          const p = passengers.find(pass => pass.seat === seatNum);
          return (
            <tr key={seatNum}>
              <td className="px-1.5 py-0.5 font-bold">{seatNum}</td>
              <td className="px-1.5 py-0.5">{p ? p.name : <span className="italic text-gray-400 print:text-gray-700">(vacío)</span>}</td>
              <td className="px-1.5 py-0.5">{p ? p.surname : ""}</td>
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
      <div className="flex items-center gap-5 mb-2 border-b border-gray-300 print:pt-3 print:pb-2 print:px-5 print:w-full">
        {association.logo && (
          <img
            src={association.logo}
            alt="Logo Asociación"
            className="h-14 w-14 object-cover rounded-full border border-gray-300 mr-3"
            style={{ minWidth: 56 }}
          />
        )}
        <div className="flex flex-col">
          <span className="text-2xl print:text-2xl font-bold text-primary mb-0.5">
            {association.name || "Asociación"}
          </span>
          {association.address && (
            <span className="text-base print:text-base text-gray-800">{association.address}</span>
          )}
          {association.phone && (
            <span className="text-base print:text-base text-gray-800">
              Tel: {association.phone}
            </span>
          )}
        </div>
      </div>
      {/* INFORMACIÓN Y LAYOUT NUEVO */}
      <div className="flex flex-row print:flex-nowrap print:gap-5 gap-5 print:px-5 w-full min-h-[150px] print:min-h-[135px]">
        {/* Croquis bus arriba izquierda */}
        <div className="flex flex-col items-center print:w-[210px] print:pl-2 flex-shrink-0">
          <BusSeatMapPrint passengers={passengers} />
        </div>
        {/* Info + tabla lista a la derecha */}
        <div className="flex flex-col flex-1">
          <span className="text-lg font-bold print:text-lg mb-1">{excursionTitle}</span>
          <div className="text-base font-semibold print:text-base mb-1">
            {fecha && <span>Fecha: {fecha}{" "}</span>}
            {hora && <span>Hora: {hora}{" "}</span>}
          </div>
          <div className="text-base font-semibold print:text-base mb-1">
            {lugar && <span>Salida: {lugar}</span>}
          </div>
          {paradas.length > 0 && (
            <div className="print:mt-1 mt-1">
              <span className="block font-semibold text-[15px] print:text-xs mb-1">Paradas adicionales:</span>
              <ul className="list-disc ml-5 text-[14px] print:text-xs mb-1">
                {paradas.map((stop, idx) =>
                  <li key={idx}>{stop}</li>
                )}
              </ul>
            </div>
          )}
          {/* Tabla lista pasajeros */}
          <div className="w-full print:pr-2 pt-1 max-w-[600px] overflow-x-auto">
            <PasajerosTableImprimir passengers={passengers} />
          </div>
        </div>
      </div>
    </div>
  );
}
