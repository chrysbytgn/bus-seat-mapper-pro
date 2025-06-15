
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

// Reglas: 2+pasillo+2, 13 filas = 4*13=52 - pero solo hay 50 así, luego fila de 5
export function BusSeatMap({ passengers, onSeatClick, excursionName }: BusSeatMapProps) {
  const getPassengerBySeat = (seat: number) =>
    passengers.find((p) => p.seat === seat);

  // Croquis correcto: 13 filas de 2-pasillo-2 (52 but only seat numbers 1-50), última fila 5 (51-55)
  const seatMap: (number | null)[][] = [];
  let currentSeat = 1;

  for (let row = 0; row < 13; row++) {
    const seatsInRow: (number | null)[] = [];
    // Izquierda
    for (let col = 0; col < 2; col++) {
      if (currentSeat <= 50) {
        seatsInRow.push(currentSeat++);
      } else {
        seatsInRow.push(null);
      }
    }
    // Pasillo como null
    seatsInRow.push(null);
    // Derecha
    for (let col = 0; col < 2; col++) {
      if (currentSeat <= 50) {
        seatsInRow.push(currentSeat++);
      } else {
        seatsInRow.push(null);
      }
    }
    seatMap.push(seatsInRow);
  }
  // Fila final de 5 asientos juntos (51-55)
  seatMap.push([51, 52, 53, 54, 55]);

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const handleSeatClick = (seat: number | null) => {
    if (seat === null) return;
    setSelectedSeat(seat);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-full bg-primary p-2">
          <span role="img" aria-label="Bus">🚌</span>
        </div>
        {/* Mostrar el nombre de la excursión */}
        <h2 className="text-2xl font-bold break-words">
          {excursionName ? excursionName : "Excursión"}
        </h2>
      </div>
      <div className="relative flex flex-col items-center">
        <div className="bg-gray-100 border border-gray-300 rounded-2xl shadow-inner p-4 w-auto" style={{ minWidth: 340 }}>
          <div className="flex flex-col gap-2">
            {/* Filas normales */}
            {seatMap.map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-row justify-center items-center gap-3">
                {/* Última fila */}
                {rowIdx === seatMap.length - 1
                  ? row.map((seat, i) =>
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
                  : row.map((seat, colIdx) =>
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
                }
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

