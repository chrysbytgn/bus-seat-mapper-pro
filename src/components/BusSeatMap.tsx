
import { useState } from "react";
import { PassengerModal } from "./PassengerModal";
import { cn } from "@/lib/utils";

export interface Passenger {
  seat: number;
  name: string;
  surname: string;
}

interface BusSeatMapProps {
  passengers: Passenger[];
  onSeatClick: (seat: number, name: string, surname: string) => void;
  excursionName?: string;
}

/**
 * Build bus seat layout remodelado:
 * - Fila 0: Conductor (izquierda), guía, null, null, null, puerta delantera (PD) (derecha)
 * - Fila 1: asientos 1 y 2 detrás del conductor, pasillo, asientos 3 y 4 derecha, espacio final
 * - Filas 2-5: 4 asientos, pasillo al centro, (5-20)
 * - Fila 6: asiento 21, asiento 22, null, null, null, puerta trasera (PT)
 * - Filas 7-13: 4 asientos, pasillo al centro, (23-50)
 * - Fila 14: null, 51, 52, 53, 54, 55 (alinear 51 detrás de 47, 55 detrás de 50)
 */
const buildSeatLayout = () => {
  const seatRows: (number | string | null)[][] = [];
  // Fila 0: Conductor, guía (espacio), null, null, null, puerta delantera
  seatRows.push([
    "C",   // Conductor
    null,  // Asiento guía (espacio libre)
    null, null, null,
    "PD"   // Puerta delantera (alineada con trasera)
  ]);
  // Fila 1: 1 y 2 (izq), null, 3 y 4 (derecha), null
  seatRows.push([
    1, 2, null, 3, 4, null
  ]);
  // Filas 2 a 5: 2+2 asientos con pasillo central (5-20)
  let currentSeat = 5;
  for (let f = 0; f < 4; f++) {
    seatRows.push([
      currentSeat, currentSeat + 1, null, currentSeat + 2, currentSeat + 3, null
    ]);
    currentSeat += 4;
  }
  // Fila 6: asiento 21, 22, nulls, puerta trasera
  seatRows.push([
    21, 22, null, null, null, "PT"
  ]);
  currentSeat = 23;
  // Filas 7-13: normales (23-50)
  for (let f = 0; f < 7; f++) {
    seatRows.push([
      currentSeat, currentSeat + 1, null, currentSeat + 2, currentSeat + 3, null
    ]);
    currentSeat += 4;
  }
  // Fila final: null, 51 (detrás del 47), 52, 53, 54, 55 (detrás del 50)
  // El asiento 47 está en la primera columna de la penúltima fila, el 50 en la última de la derecha
  // null en la izquierda para alinear 51 exactamente detrás de 47 y 55 detrás de 50
  seatRows.push([
    null,   // para que 51 quede detrás de 47
    51,
    52,
    53,
    54,
    55    // detrás de 50 a la derecha
  ]);
  return seatRows;
};

export function BusSeatMap({ passengers, onSeatClick, excursionName }: BusSeatMapProps) {
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
                  // Puerta delantera/trasera
                  if (cell === "PD" || cell === "PT") {
                    return (
                      <div
                        key={cell}
                        className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-400 bg-white"
                        title={cell === "PD" ? "Puerta delantera" : "Puerta trasera"}
                      >
                        <span className="block w-full border-b-2 border-dashed border-gray-700" style={{ height: 14 }} />
                      </div>
                    );
                  }
                  // Pasillo/espacio vacío
                  if (cell === null) {
                    return <div key={"pasillo-" + colIdx + "-" + rowIdx} className="w-6 h-10 sm:w-8 sm:h-10" />;
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
                    >{seatNum}</button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Leyenda */}
        <div className="flex gap-3 mt-4 text-sm">
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
            <div className="w-5 h-5 bg-white border border-gray-600 relative flex items-center justify-center">
              <span className="block w-full border-b-2 border-dashed border-gray-700 absolute left-0 right-0 top-1/2 -translate-y-1/2" />
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
