import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PassengerModal } from "./PassengerModal";
import { Book } from "lucide-react";

export interface Passenger {
  seat: number;
  name: string;
  surname: string;
  phone?: string;
}

interface BusSeatMapProps {
  passengers: Passenger[];
  onSeatClick: (seat: number, name: string, surname: string) => void;
  excursionName?: string;
}

/**
 * Croquis de bus 55 plazas con layout mejorado:
 * - Conductor (izquierda) + Guía/Líder (derecha) + Puerta principal al lado del guía
 * - Filas 1-7: Asientos 01-28 (4 por fila)
 * - Fila especial: Asientos 29-30 (izquierda) + Puerta trasera (derecha, detrás de 27-28)
 * - Filas intermedias: Asientos 31-50
 * - Fila final: Asientos 51-55 (todos en una sola fila)
 */
const buildSeatLayout = () => {
  const seatRows: (number | string | null)[][] = [];
  
  // Fila 0: Conductor + Guía + Puerta principal al lado del guía
  seatRows.push([
    "C",    // Conductor
    null,   // Espacio
    null,   // Pasillo central
    "G",    // Guía/Líder
    "P",    // Puerta principal al lado del guía
  ]);
  
  // Filas 1-7: Asientos 01-28 (7 filas × 4 asientos = 28 asientos)
  let currentSeat = 1;
  for (let fila = 0; fila < 7; fila++) {
    seatRows.push([
      currentSeat,     // Izquierda 1
      currentSeat + 1, // Izquierda 2
      null,            // Pasillo
      currentSeat + 2, // Derecha 1
      currentSeat + 3, // Derecha 2
    ]);
    currentSeat += 4;
  }
  
  // Fila especial: Asientos 29-30 (izquierda) + Puerta trasera (derecha, detrás de 27-28)
  seatRows.push([
    29,     // Asiento 29 (izquierda, detrás de 25)
    30,     // Asiento 30 (izquierda, detrás de 26)
    null,   // Pasillo
    "PT",   // Puerta trasera (derecha, detrás de 27)
    "PT",   // Puerta trasera (derecha, detrás de 28)
  ]);
  
  // Filas intermedias: Asientos 31-50 (5 filas × 4 asientos = 20 asientos)
  currentSeat = 31;
  for (let fila = 0; fila < 5; fila++) {
    seatRows.push([
      currentSeat,     // Izquierda 1
      currentSeat + 1, // Izquierda 2
      null,            // Pasillo
      currentSeat + 2, // Derecha 1
      currentSeat + 3, // Derecha 2
    ]);
    currentSeat += 4;
  }
  
  // Fila final: Asientos 51-55 (todos en una sola fila)
  seatRows.push([
    51,     // Asiento 51
    52,     // Asiento 52
    53,     // Asiento 53 (centro)
    54,     // Asiento 54
    55,     // Asiento 55
  ]);
  
  return seatRows;
};

export function BusSeatMap({ passengers, excursionName, onSeatClick }: BusSeatMapProps) {
  const getPassengerBySeat = (seat: number) =>
    passengers.find((p) => p.seat === seat);

  const seatMap = buildSeatLayout();
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const handleSeatClick = (seat: number | null) => {
    if (seat === null || seat === undefined) return;
    setSelectedSeat(seat);
  };

  return (
    <div>
      {/* Mostrar nombre excursión */}
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-full bg-primary p-2">
          <span role="img" aria-label="Bus">🚌</span>
        </div>
        <h2 className="text-2xl font-bold break-words">
          {excursionName ? excursionName : "Excursión"}
        </h2>
      </div>
      <div className="relative flex flex-col items-center">
        <div className="bg-gray-100 border border-gray-300 rounded-2xl shadow-inner px-4 py-4 w-fit max-w-full">
          <div className="flex flex-col gap-2">
            {seatMap.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex flex-row justify-center items-center gap-1 sm:gap-2"
              >
                {row.map((cell, colIdx) => {
                  // Conductor
                  if (cell === "C") {
                    return (
                      <div
                        key="conductor"
                        className="w-12 h-12 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-extrabold border border-gray-400 text-[18px] bg-gray-700 text-white"
                        title="Conductor"
                      >
                        🚍
                      </div>
                    );
                  }
                  // Guía/Líder
                  if (cell === "G") {
                    return (
                      <div
                        key="guia"
                        className="w-12 h-12 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-extrabold border border-gray-400 bg-blue-600 text-white"
                        title="Guía/Líder del grupo"
                      >
                        <Book size={20} />
                      </div>
                    );
                  }
                  // Puerta principal y puerta trasera
                  if (cell === "P" || cell === "PT") {
                    return (
                      <div
                        key={cell + "-" + colIdx}
                        className="w-12 h-12 sm:w-10 sm:h-6 flex items-center justify-center border border-gray-400 bg-yellow-200"
                        title={cell === "P" ? "Puerta principal" : "Puerta trasera"}
                      >
                        <span className="text-[10px] font-bold text-gray-700">
                          PUERTA
                        </span>
                      </div>
                    );
                  }
                  // Pasillo/espacio vacío
                  if (cell === null) {
                    return <div key={"espacio-" + colIdx + "-" + rowIdx} className="w-6 h-10 sm:w-8 sm:h-10" />;
                  }
                  // Asientos normales clicables
                  const seatNum = Number(cell);
                  const ocupado = !!getPassengerBySeat(seatNum);
                  return (
                    <button
                      key={seatNum}
                      type="button"
                      className={cn(
                        "w-12 h-12 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-lg border-2 select-none transition-all shadow cursor-pointer",
                        ocupado
                          ? "bg-red-500 text-white hover:bg-red-600 border-red-700"
                          : "bg-green-500 text-white hover:bg-green-600 border-green-700",
                        selectedSeat === seatNum ? "ring-4 ring-primary/60 z-10" : ""
                      )}
                      onClick={() => handleSeatClick(seatNum)}
                    >
                      {seatNum.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Leyenda mejorada */}
        <div className="flex gap-3 mt-4 text-sm flex-wrap justify-center">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-green-500 border" />
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-red-500 border" />
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-gray-700 border" />
            <span>Conductor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-blue-600 border flex items-center justify-center">
              <Book size={12} className="text-white" />
            </div>
            <span>Guía</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-3 bg-yellow-200 border border-gray-600 text-[8px] flex items-center justify-center">
              <span className="text-gray-700 font-bold">P</span>
            </div>
            <span>Puerta</span>
          </div>
        </div>
        {/* Modal */}
        <PassengerModal
          open={selectedSeat !== null}
          onClose={() => setSelectedSeat(null)}
          seatNumber={selectedSeat}
          defaultName={selectedSeat ? (getPassengerBySeat(selectedSeat)?.name ?? "") : ""}
          defaultSurname={selectedSeat ? (getPassengerBySeat(selectedSeat)?.surname ?? "") : ""}
          onSave={(name, surname) => {
            if (selectedSeat) {
              onSeatClick(selectedSeat, name, surname);
            }
          }}
        />
      </div>
    </div>
  );
}
