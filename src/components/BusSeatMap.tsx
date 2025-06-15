
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
 * Build bus seat layout:
 * - Row 0: Driver (far left), then space for guide, then nulls, then front door (PD, far right)
 * - Row 1: seat 1 (behind driver), seat 2, null, seat 3, seat 4, null
 * - Rows 2-5: standard 4-seat rows (seats 5-20)
 * - Row 6: seat 21, nulls, rear door (PT, far right) (seat 22 is NOT in front of rear door)
 * - Rows 7-13: seats 23-50, regular rows
 * - Row 14: final row, 5 seats centered so that seat 51 aligns behind 47, null-padding left
 */
const buildSeatLayout = () => {
  const seatRows: (number | string | null)[][] = [];
  // Row 0: Driver (left), guide (null), null, null, null, front door (PD)
  seatRows.push([
    "C",   // Driver
    null,  // Guide seat (free space)
    null, null, null,
    "PD"   // Front door (aligned vertically with rear door)
  ]);
  // Row 1: seat 1 (behind driver), seat 2, null (aisle), seat 3, seat 4, null
  seatRows.push([
    1, 2, null, 3, 4, null
  ]);
  // Rows 2-5: 2+2 seats, aisle in center, seats 5-20
  let currentSeat = 5;
  for (let f = 0; f < 4; f++) {
    seatRows.push([
      currentSeat, currentSeat + 1, null, currentSeat + 2, currentSeat + 3, null
    ]);
    currentSeat += 4;
  }
  // Row 6: seat 21 (left, aligned vertically with previous rows' left seats),
  // rest nulls, then rear door ("PT") at far right, seat 22 is not present in this row
  seatRows.push([
    21, null, null, null, null, "PT"
  ]);
  currentSeat = 23;
  // Rows 7-13: 2+2 seats, aisle center, seats 23-50 (7 rows)
  for (let f = 0; f < 7; f++) {
    seatRows.push([
      currentSeat, currentSeat + 1, null, currentSeat + 2, currentSeat + 3, null
    ]);
    currentSeat += 4;
  }
  // Final row 14: center the five seats so that seat 51 is behind 47
  // Look up which "col" seat 47 is in: our row structure is [seat, seat, null, seat, seat, null]
  // seat 47 is first of last group: 47, 48, null, 49, 50, null (row 13)
  // So 47 in index 0, last row should be: null, 51, 52, 53, 54, 55 (51 directly behind 47)
  seatRows.push([
    null, 51, 52, 53, 54, 55 // keep as much left as possible so 51 is exactly behind 47 (which is in col 0)
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
