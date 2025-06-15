
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
 * Croquis de bus 55 plazas, todas las filas con la misma cantidad de columnas (=6),
 * para alinear verticalmente los asientos de izquierda a derecha:
 * Índices de columnas de todas las filas: [0, 1, 2, 3, 4, 5]
 * 
 * - Fila 0: Conductor(0), guía(1), null(2), null(3), null(4), Puerta Delantera(5)
 * - Fila 1: 1(0), 2(1), null(2), 3(3), 4(4), null(5)
 * - Filas 2-5: normales, [5,6,null,7,8,null], etc.
 * - Fila 6: 21(0), 22(1), null(2), null(3), null(4), PT(5)
 * - Filas 7-13: normales, [23,24,null,25,26,null], etc.
 * - Fila 14: null(0), 51(1), 52(2), 53(3), 54(4), 55(5)
 */
const buildSeatLayout = () => {
  const seatRows: (number | string | null)[][] = [];
  // Fila 0
  seatRows.push([
    "C",   // 0: conductor
    null,  // 1: guía (espacio libre)
    null,  // 2
    null,  // 3
    null,  // 4
    "PD",  // 5: Puerta Delantera
  ]);
  // Fila 1
  seatRows.push([1, 2, null, 3, 4, null]);
  // Filas 2-5
  let currentSeat = 5;
  for (let f = 0; f < 4; f++) {
    seatRows.push([
      currentSeat,        // 0
      currentSeat + 1,    // 1
      null,               // 2: pasillo
      currentSeat + 2,    // 3
      currentSeat + 3,    // 4
      null                // 5: lateral
    ]);
    currentSeat += 4;
  }
  // Fila 6: 21 (0), 22 (1), null (2,3,4), PT (5)
  seatRows.push([
    21,   // Está alineado con los otros asientos columna 0
    22,   // Alineado con 2,6,10,14,18, etc.
    null, // Pasillo central
    null,
    null,
    "PT"
  ]);
  currentSeat = 23;
  // Filas 7-13: (23-50)
  for (let f = 0; f < 7; f++) {
    seatRows.push([
      currentSeat,
      currentSeat + 1,
      null,
      currentSeat + 2,
      currentSeat + 3,
      null
    ]);
    currentSeat += 4;
  }
  // Fila final: null (0), 51 (1), 52 (2), 53 (3), 54 (4), 55 (5)
  seatRows.push([
    null, // Para que 51 quede detrás de 47 (columna 1)
    51,   // Detrás de 47 (columna 1)
    52,   // Detrás de 48 (columna 2)
    53,   // Detrás de 49 (columna 3)
    54,   // Detrás de 50 (columna 4)
    55    // Detrás de 50/lateral derecho (columna 5, igual que el resto de filas)
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
