
import React from "react";
import { Passenger } from "./BusSeatMap";
import { cn } from "@/lib/utils";

// Lógica igual que en BusSeatMap.tsx
const buildSeatLayout = () => {
  let currentSeat = 1;
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
  // Asiento 21 va adelantado una fila arriba respecto a los demás
  let idx21 = seatRows.findIndex((row) => row[0] === 21);
  if (idx21 > 0) {
    const temp = seatRows[idx21 - 1][0];
    seatRows[idx21 - 1][0] = 21;
    seatRows[idx21][0] = temp;
  }
  seatRows.push([51, 52, 53, 54, 55]); // fila de 5 asientos al final
  return seatRows;
};

export function BusSeatMapPrint({ passengers }: { passengers: Passenger[] }) {
  const getPassengerBySeat = (seat: number) =>
    passengers.find((p) => p.seat === seat);

  const seatMap = buildSeatLayout();

  return (
    <div className="flex flex-col items-center bg-white p-2 print:bg-white print:p-0 rounded-xl w-fit max-w-full">
      <span className="block text-center text-[14px] print:text-xs font-bold mb-1">Croquis bus</span>
      <div className="bg-gray-50 border border-gray-400 rounded-2xl shadow px-1 py-1 print:shadow-none print:border flex flex-col min-w-[210px] max-w-full">
        <div
          className="flex flex-col gap-[1.6px] print:gap-[0.9px]"
          style={{
            width: "195px",
            minWidth: "195px",
            maxWidth: "100%",
            background: "#f8fafc"
          }}
        >
          {seatMap.map((row, rowIdx) => (
            <div key={rowIdx} className="flex flex-row gap-[1.6px] print:gap-[0.9px]">
              {row.every(s => s === null) ? (
                <div className="h-4 w-full" aria-label="Pasillo / puerta trasera" />
              ) : (
                row.map((seat, colIdx) =>
                  seat === null ? (
                    <div key={colIdx} className="w-4 print:w-3" />
                  ) : (
                    <div
                      key={seat}
                      className={cn(
                        "w-7 h-7 print:w-5 print:h-5 rounded-[6px] flex items-center justify-center font-semibold border text-[11px] print:text-[9px]",
                        getPassengerBySeat(seat)
                          ? "bg-red-400/90 text-white border-red-500 shadow"
                          : "bg-green-50 text-red-500"
                      )}
                    >
                      {seat}
                    </div>
                  )
                )
              )}
            </div>
          ))}
        </div>
        <div className="mt-1 flex flex-row justify-center gap-2 w-full print:text-[8px]">
          <div className="w-3 h-3 bg-green-50 border border-green-500 rounded-sm" />
          <span className="text-[9px]">Libre</span>
          <div className="mx-1 w-3 h-3 bg-red-400 border border-red-500 rounded-sm" />
          <span className="text-[9px]">Ocup.</span>
        </div>
      </div>
    </div>
  );
}
