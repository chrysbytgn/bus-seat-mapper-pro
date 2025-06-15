
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
  const getPassengerBySeat = (seat: number) =>
    passengers.find(p => p.seat === seat);

  // Nuevo croquis siguiendo requisitos: grupos de 2 asientos por lado, pasillo al centro, última fila 5 asientos juntos
  const seatMap: (number | null)[][] = [];
  let currentSeat = 1;
  for (let row = 0; row < BUS_ROWS - 1; row++) {
    const seatsInRow: (number | null)[] = [];
    for (let col = 0; col < BUS_COLUMNS; col++) {
      if (col === 2) { // pasillo visual
        seatsInRow.push(null);
      } else if (currentSeat <= 50) {
        seatsInRow.push(currentSeat++);
      } else {
        seatsInRow.push(null);
      }
    }
    seatMap.push(seatsInRow);
  }
  // Última fila: 5 asientos juntos (51-55)
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
        <h2 className="text-xl font-bold">Croquis del autobús (55 plazas)</h2>
      </div>
      <div className="relative flex flex-col items-center">
        {/* Bus outline */}
        <div className="bg-gray-100 border border-gray-300 rounded-2xl shadow-inner p-4 w-auto" style={{ minWidth: 340 }}>
          <div className="flex flex-col gap-2">
            {seatMap.map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-row justify-center items-center gap-3">
                {/* Última fila: mostrar los 5 asientos juntos */}
                {rowIdx === seatMap.length - 1
                  ? row.map((seat, i) =>
                      seat ? (
                        <button
                          key={seat}
                          type="button"
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-xs border shadow-sm select-none transition-all",
                            getPassengerBySeat(seat)
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600",
                            selectedSeat === seat ? "ring-2 ring-primary/70 z-10" : ""
                          )}
                          onClick={() => handleSeatClick(seat)}
                        >{seat}</button>
                      ) : (
                        <div key={i} className="w-6 h-9" />
                      )
                    )
                  : row.map((seat, colIdx) =>
                      seat ? (
                        <button
                          key={seat}
                          type="button"
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-xs border shadow-sm select-none transition-all",
                            getPassengerBySeat(seat)
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600",
                            selectedSeat === seat ? "ring-2 ring-primary/70 z-10" : ""
                          )}
                          onClick={() => handleSeatClick(seat)}
                        >{seat}</button>
                      ) : (
                        <div key={colIdx} className="w-6 h-9" />
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
