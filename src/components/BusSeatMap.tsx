
import { useState } from "react";
import { PassengerModal } from "./PassengerModal";
import { cn } from "@/lib/utils";

const BUS_ROWS = 14;
const BUS_COLUMNS = 4; // 2 + pasillo + 2
const TOTAL_SEATS = 55;

export interface Passenger {
  seat: number;
  name: string;
  surname: string;
}

interface BusSeatMapProps {
  passengers: Passenger[];
  onSeatClick: (seat: number, name: string, surname: string) => void;
}

export function BusSeatMap({ passengers, onSeatClick }: BusSeatMapProps) {
  // Para croquis de bus clásico (2-2), los dos primeros asientos en fila 1 son guía y conductor
  // Renderizaremos las filas de asientos en un grid

  const getPassengerBySeat = (seat: number) =>
    passengers.find(p => p.seat === seat);

  // Mapea los asientos a su posición en el bus (ver imagen buses convencionales)
  const seatMap: (number | null)[][] = [];
  let currentSeat = 1;
  for (let row = 0; row < BUS_ROWS; row++) {
    const seatsInRow = [];
    for (let col = 0; col < BUS_COLUMNS; col++) {
      // Simular el pasillo:
      if (col === 2) {
        seatsInRow.push(null);
      } else if (currentSeat <= TOTAL_SEATS) {
        seatsInRow.push(currentSeat++);
      } else {
        seatsInRow.push(null);
      }
    }
    seatMap.push(seatsInRow);
  }

  // 3 asientos finales juntos en la última fila del bus (tipo europeo)
  seatMap[seatMap.length - 1] = [52, 53, 54, 55];

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const handleSeatClick = (seat: number | null) => {
    if (seat === null) return;
    setSelectedSeat(seat);
  };

  // Ayuda visual de filas y asientos, con croquis rectangular y responsive.
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-full bg-primary p-2">
          <span role="img" aria-label="Bus">🚌</span>
        </div>
        <h2 className="text-xl font-bold">Croquis del autobús (55 plazas)</h2>
      </div>
      <div className="relative flex flex-col items-center">
        {/* Bus outline */}
        <div className="bg-gray-100 border border-gray-300 rounded-2xl shadow-inner p-4 w-auto" style={{ minWidth: 340 }}>
          <div className="flex flex-col gap-2">
            {seatMap.map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-row justify-center items-center gap-3">
                {row.map((seat, colIdx) =>
                  seat ? (
                    <button
                      type="button"
                      key={seat}
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-xs border shadow-sm select-none transition-all",
                        getPassengerBySeat(seat)
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-green-500 text-white hover:bg-green-600",
                        selectedSeat === seat ? "ring-2 ring-primary/70 z-10" : ""
                      )}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {seat}
                    </button>
                  ) : (
                    <div key={colIdx} className="w-6 h-9" />
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
