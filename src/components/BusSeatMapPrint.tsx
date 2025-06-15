import React from "react";
import { Passenger } from "./BusSeatMap";
import { cn } from "@/lib/utils";

// Layout de asiento modificado para reflejar proporción y posiciones según la imagen
const SEAT_LAYOUT = [
  [null, "guia", null, null, null],                 // Fila 1: conductor/guía
  [null, null, null, null, null],                   // Espacio delantero (puede ser maletero o puerta delantera)
  [1, 2, null, 3, 4],
  [5, 6, null, 7, 8],
  [9, 10, null, 11, 12],
  [13, 14, null, 15, 16],
  [17, 18, null, 19, 20],
  [21, 22, null, 23, 24],
  [25, 26, null, 27, 28],
  [29, 30, null, 31, 32],
  [33, 34, null, 35, 36],
  [37, 38, null, 39, 40],
  [41, 42, null, 43, 44],
  [45, 46, null, 47, 48],
  [49, 50, null, 51, 52],
  [53, 54, 55, null, null],
];

// Ayuda: asientos verticales para detectar la puerta (como en el layout)
const PUERTA_ROWS = [2, 9];

export function BusSeatMapPrint({ passengers }: { passengers: Passenger[] }) {
  const getPassengerBySeat = (seat: number) =>
    passengers.find((p) => p.seat === seat);

  // Render helpers
  function renderSeat(seat: number | "guia" | null, rowIdx: number, colIdx: number) {
    if (seat === null) {
      // Espacios vacíos, maletero o corredores
      if (
        (rowIdx === 0 && colIdx === 4) ||
        (rowIdx === SEAT_LAYOUT.length - 1 && colIdx === 2)
      ) {
        // No se dibuja nada: estos son solo espacios fuera
        return <div key={"empty" + colIdx + "-" + rowIdx} className="w-[32px] h-[28px]" />;
      }
      if (PUERTA_ROWS.includes(rowIdx) && colIdx === 4) {
        return (
          <div key={"puerta-" + rowIdx} className="flex flex-col items-center justify-center w-[32px] h-[38px] print:h-[32px]">
            <div
              className="w-[22px] h-[34px] print:h-[26px] border-l-4 border-gray-300 rounded-r-lg relative flex items-center justify-center"
              style={{ borderColor: "#555", marginLeft: "-2px" }}
            >
              <span
                className="absolute left-[2px] top-1.5 text-[10px] font-semibold text-gray-700 rotate-90 select-none"
                style={{ letterSpacing: "1.5px" }}
              >
                PUERTA
              </span>
            </div>
          </div>
        );
      }
      // Espacio normal vacío
      return <div key={"space" + colIdx + "-" + rowIdx} className="w-[32px] h-[28px]" />;
    }
    if (seat === "guia") {
      return (
        <div
          key="guia"
          className="relative flex flex-col items-center w-[38px] h-[52px] justify-end"
        >
          {/* volante */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="rounded-full border-2 border-gray-500 bg-gray-200 w-8 h-8 flex items-center justify-center">
              <svg width="20" height="20">
                <circle cx="10" cy="10" r="8" stroke="#535" strokeWidth="1.5" fill="none" />
                <circle cx="10" cy="10" r="2.5" stroke="#999" strokeWidth="2" fill="#ccc" />
                <path d="M10 1.6 L10 18.4" stroke="#666" strokeWidth="1.2"/>
                <path d="M1.6 10 L18.4 10" stroke="#666" strokeWidth="1.2"/>
              </svg>
            </div>
          </div>
          {/* asiento guía */}
          <div className="w-[33px] h-[25px] bg-white border-2 border-gray-400 rounded-md mt-8 flex items-center justify-center print:text-[10px] text-[11px] font-bold italic text-gray-600">
            Guía
          </div>
        </div>
      );
    }
    // Asiento normal
    const passenger = getPassengerBySeat(seat as number);
    return (
      <div
        key={seat}
        className={cn(
          "relative w-[32px] h-[28px] flex flex-col items-center justify-center",
        )}
      >
        <div
          className={cn(
            "w-full h-full rounded-[5px] border-2 border-gray-400/80 flex items-center justify-center text-xs font-semibold",
            passenger
              ? "bg-red-400/90 text-white border-red-500 shadow"
              : "bg-green-50 text-red-500"
          )}
          style={{
            fontSize: 12,
            lineHeight: "15px"
          }}
        >
          <span className="mx-auto">{String(seat).padStart(2, "0")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="print:mx-auto flex flex-col items-center bg-white p-2 print:bg-white print:p-0 rounded-xl w-fit max-w-full">
      <span className="block text-center text-[16px] print:text-xs font-bold mb-1">Croquis bus</span>
      <div className="bg-gray-50 border border-gray-400 rounded-2xl shadow px-3 py-3 print:border print:shadow-none flex flex-col min-w-[275px] max-w-full">
        {/* Despliegue filas */}
        <div className="flex flex-col gap-[2px] items-center min-w-[250px]">
          {SEAT_LAYOUT.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={cn(
                "flex flex-row items-center justify-center",
                "gap-[6px]"
              )}
              style={{
                minHeight: "30px",
                minWidth: "246px"
              }}
            >
              {row.map((seat, colIdx) => renderSeat(seat, rowIdx, colIdx))}
            </div>
          ))}
        </div>
        {/* Leyenda */}
        <div className="mt-3 flex flex-row justify-center gap-2 w-full">
          <div className="w-3 h-3 bg-green-50 border border-green-500 rounded-sm" />
          <span className="text-[9px]">Libre</span>
          <div className="mx-1 w-3 h-3 bg-red-400 border border-red-500 rounded-sm" />
          <span className="text-[9px]">Ocup.</span>
        </div>
      </div>
    </div>
  );
}
