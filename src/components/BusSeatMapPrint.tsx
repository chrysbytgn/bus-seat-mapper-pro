
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

// Para impresión B/N: asientos ocupados = relleno negro + texto blanco, libres = borde sólido únicamente
export function BusSeatMapPrint({ passengers }: { passengers: Passenger[] }) {
  const getPassengerBySeat = (seat: number) =>
    passengers.find((p) => p.seat === seat);

  const seatMap = buildSeatLayout();

  return (
    <div className="flex flex-col items-center bg-white p-1 print:bg-white print:p-0 rounded-xl w-fit max-w-full">
      <span className="block text-center text-[12px] print:text-[10px] font-bold mb-0.5">
        Croquis bus
      </span>
      <div className="bg-white border border-black rounded-lg px-1 py-1 print:shadow-none print:border flex flex-col"
        style={{ minWidth: 180, maxWidth: "100%" }}
      >
        <div
          className="flex flex-col gap-[1px] print:gap-[1px]"
          style={{
            width: "164px",
            minWidth: "164px",
            maxWidth: "100%",
            background: "#fff"
          }}
        >
          {seatMap.map((row, rowIdx) => (
            <div key={rowIdx} className="flex flex-row gap-[1px] print:gap-[1px]">
              {row.every(s => s === null) ? (
                <div className="h-3 w-full" aria-label="Pasillo / puerta trasera" />
              ) : (
                row.map((seat, colIdx) =>
                  seat === null ? (
                    <div key={colIdx} className="w-3 print:w-2" />
                  ) : (
                    <div
                      key={seat}
                      className={cn(
                        "w-5 h-5 print:w-4 print:h-4 rounded-[2px] flex items-center justify-center font-bold border border-black text-[10px] print:text-[8px] box-content",
                        getPassengerBySeat(seat)
                          ? "bg-black text-white border-2 border-black"
                          : "bg-white text-black border-2 border-black"
                      )}
                      style={{
                        // Para B/N, si ocupado le ponemos una trama visual extra
                        background:
                          getPassengerBySeat(seat)
                            ? "repeating-linear-gradient(-45deg, #222 0 2px, #fff 2px 4px)"
                            : "none"
                      }}
                    >
                      {seat}
                    </div>
                  )
                )
              )}
            </div>
          ))}
        </div>
        <div className="mt-0.5 flex flex-row justify-center gap-2 w-full print:text-[8px]">
          <div
            className="w-3 h-3 border border-black rounded-sm inline-block"
            style={{
              background: "none"
            }}
          />
          <span className="text-[8px]">Libre</span>
          <div
            className="mx-1 w-3 h-3 border border-black rounded-sm inline-block"
            style={{
              background: "repeating-linear-gradient(-45deg, #222 0 2px, #fff 2px 4px)"
            }}
          />
          <span className="text-[8px]">Ocup.</span>
        </div>
      </div>
    </div>
  );
}
