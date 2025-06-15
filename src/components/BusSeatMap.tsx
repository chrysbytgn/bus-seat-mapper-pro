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

// Reglas: 13 filas 2+pasillo+2 (hasta el 50), detrás de la fila con asientos 19/20 hay un espacio (puerta trasera), y la fila 49-50 alineados correctamente. Luego fila de 5 (51-55).
export function BusSeatMap({ passengers, onSeatClick, excursionName }: BusSeatMapProps) {
  const getPassengerBySeat = (seat: number) =>
    passengers.find((p) => p.seat === seat);

  // Corrección: eliminamos la declaración duplicada de seatMap (quedándonos solo con seatRows)
  let currentSeat = 1;

  // Agregamos el croquis como antes, pero almacenando las filas en un arreglo temporal.
  const seatRows: (number | null)[][] = [];

  for (let row = 0; row < 13; row++) {
    const seatsInRow: (number | null)[] = [];
    for (let col = 0; col < 2; col++) {
      if (currentSeat <= 50) {
        seatsInRow.push(currentSeat++);
      } else {
        seatsInRow.push(null);
      }
    }
    seatsInRow.push(null);
    for (let col = 0; col < 2; col++) {
      if (currentSeat <= 50) {
        seatsInRow.push(currentSeat++);
      } else {
        seatsInRow.push(null);
      }
    }
    seatRows.push(seatsInRow);

    if (row === 4) {
      seatRows.push([null, null, null, null, null]); // Fila vacía como espacio/pasillo
    }
  }

  // --- Cambiamos la fila de asientos 21-22 una posición arriba ---
  let idx21 = seatRows.findIndex((row) => row.includes(21));
  if (idx21 > 0) {
    // Intercambiamos esa fila con la anterior (para subirla una posición)
    const tmp = seatRows[idx21 - 1];
    seatRows[idx21 - 1] = seatRows[idx21];
    seatRows[idx21] = tmp;
  }

  // Añadimos la fila final de 5 asientos juntos (51-55)
  seatRows.push([51, 52, 53, 54, 55]);

  // seatMap ahora es seatRows
  const seatMap = seatRows;

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const handleSeatClick = (seat: number | null) => {
    if (seat === null) return;
    setSelectedSeat(seat);
  };

  return (
    <div>
      {/* Mostrar el nombre de la excursión */}
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-full bg-primary p-2">
          <span role="img" aria-label="Bus">🚌</span>
        </div>
        <h2 className="text-2xl font-bold break-words">
          {excursionName ? excursionName : "Excursión"}
        </h2>
      </div>
      <div className="relative flex flex-col items-center">
        <div className="bg-gray-100 border border-gray-300 rounded-2xl shadow-inner p-4 w-auto" style={{ minWidth: 340 }}>
          <div className="flex flex-col gap-2">
            {seatMap.map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-row justify-center items-center gap-3">
                {/* Fila final de 5 asientos */}
                {rowIdx === seatMap.length - 1 ? (
                  row.map((seat, i) =>
                    seat ? (
                      <button
                        key={seat}
                        type="button"
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg border shadow-sm select-none transition-all",
                          getPassengerBySeat(seat)
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-green-500 text-white hover:bg-green-600",
                          selectedSeat === seat ? "ring-4 ring-primary/60 z-10" : ""
                        )}
                        onClick={() => handleSeatClick(seat)}
                      >{seat}</button>
                    ) : (
                      <div key={i} className="w-6 h-9" />
                    )
                  )
                ) : row.every((s) => s === null) ? (
                  // Única fila de pasillo debajo de los asientos 19/20
                  <div className="h-10 w-[260px] sm:w-[340px]" aria-label="Pasillo / puerta trasera" />
                ) : (
                  row.map((seat, colIdx) =>
                    seat === null ? (
                      // Pasillo
                      <div key={"p-" + colIdx} className="w-8 sm:w-12" />
                    ) : (
                      <button
                        key={seat}
                        type="button"
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg border shadow-sm select-none transition-all",
                          getPassengerBySeat(seat)
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-green-500 text-white hover:bg-green-600",
                          selectedSeat === seat ? "ring-4 ring-primary/60 z-10" : ""
                        )}
                        onClick={() => handleSeatClick(seat)}
                      >{seat}</button>
                    )
                  )
                )}
              </div>
            ))}
          </div>
        </div>
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
