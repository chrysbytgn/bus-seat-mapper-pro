
import React from "react";
import { Passenger } from "./BusSeatMap";
import { BusSeatMapPrint } from "./BusSeatMapPrint";
import { getAssociationConfig } from "@/utils/associationConfig";
import type { ExcursionData } from "@/pages/Index";

// Constante para la lista completa de asientos
const ALL_SEATS = Array.from({ length: 55 }, (_, i) => i + 1);

function PasajerosTableImprimir({ passengers }: { passengers: Passenger[] }) {
  return (
    <table className="w-full text-xl print:text-base border-separate border-spacing-y-[2px]">
      <thead>
        <tr>
          <th className="text-left px-2 py-1 print:px-2 print:py-1">#</th>
          <th className="text-left px-2 py-1 print:px-2 print:py-1">Nombre</th>
          <th className="text-left px-2 py-1 print:px-2 print:py-1">Apellido</th>
        </tr>
      </thead>
      <tbody>
        {ALL_SEATS.map(seatNum => {
          const p = passengers.find(pass => pass.seat === seatNum);
          return (
            <tr key={seatNum}>
              <td className="px-2 py-1 font-bold text-lg print:text-base">{seatNum}</td>
              <td className="px-2 py-1 print:text-base">{p ? p.name : <span className="italic text-gray-400 print:text-gray-700">(vacío)</span>}</td>
              <td className="px-2 py-1 print:text-base">{p ? p.surname : ""}</td>
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
  // Configuración de la asociación
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
            className="h-16 w-16 object-cover rounded-full border border-gray-300 mr-3"
            style={{ minWidth: 64 }}
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
      {/* INFORMACIÓN DE EXCURSIÓN */}
      <div className="flex flex-row justify-between print:gap-4 gap-4 print:px-5">
        <div className="flex flex-col flex-1">
          <span className="text-2xl font-bold print:text-2xl mb-1">{excursionTitle}</span>
          <div className="text-lg font-semibold print:text-lg mb-1">
            {fecha && <span>Fecha: {fecha}{"  "}</span>}
            {hora && <span>Hora: {hora}{"  "}</span>}
          </div>
          <div className="text-lg font-semibold print:text-lg mb-1">
            {lugar && <span>Salida: {lugar}</span>}
          </div>
          {paradas.length > 0 && (
            <div className="print:mt-2 mt-2">
              <span className="block font-semibold text-md mb-1">Paradas adicionales:</span>
              <ul className="list-disc ml-5 text-base print:text-base">
                {paradas.map((stop, idx) =>
                  <li key={idx}>{stop}</li>
                )}
              </ul>
            </div>
          )}
        </div>
        {/* Croquis bus */}
        <div className="flex flex-col items-center print:w-[31%] print:max-w-[28mm] print:pl-2 print:border-l print:border-gray-300">
         <BusSeatMapPrint passengers={passengers} />
        </div>
      </div>
      {/* LISTA PASAJEROS */}
      <div className="print:px-5 pt-3">
        <PasajerosTableImprimir passengers={passengers} />
      </div>
    </div>
  );
}
