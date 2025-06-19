
import React from "react";
import { Passenger } from "./BusSeatMap";
import { cn } from "@/lib/utils";

// Layout unificado para impresión - IDÉNTICO al de BusSeatMap.tsx
const buildSeatLayout = () => {
  const seatRows: (number | string | null)[][] = [];
  
  // Fila 0: Solo conductor
  seatRows.push([
    "C",    // Conductor
    null,   // Espacio
    null,   // Espacio
    null,   // Espacio
    null,   // Espacio
  ]);
  
  // Fila 1: Asientos 1-2 a la izquierda + puerta delantera a la derecha
  seatRows.push([
    1,      // Asiento 1
    2,      // Asiento 2
    null,   // Pasillo
    "PD",   // Puerta delantera (derecha)
    null,   // Espacio
  ]);
  
  // Filas 2-5: Asientos 3-18 (estructura normal 2+2 con pasillo)
  let currentSeat = 3;
  for (let f = 0; f < 4; f++) {
    seatRows.push([
      currentSeat,     // Izquierda 1
      currentSeat + 1, // Izquierda 2
      null,            // Pasillo
      currentSeat + 2, // Derecha 1
      currentSeat + 3, // Derecha 2
    ]);
    currentSeat += 4;
  }
  
  // Filas 6-12: Asientos 19-46 (estructura normal 2+2)
  for (let f = 0; f < 7; f++) {
    seatRows.push([
      currentSeat,     // Izquierda 1
      currentSeat + 1, // Izquierda 2
      null,            // Pasillo
      currentSeat + 2, // Derecha 1
      currentSeat + 3, // Derecha 2
    ]);
    currentSeat += 4;
  }
  
  // Fila 13: Asientos 47-50 + puerta trasera (derecha)
  seatRows.push([
    47,   // Izquierda 1
    48,   // Izquierda 2
    null, // Pasillo
    49,   // Derecha 1
    50,   // Derecha 2
  ]);
  
  // Fila 14: Puerta trasera a la derecha + últimos 3 asientos
  seatRows.push([
    51,   // Izquierda 1
    52,   // Izquierda 2
    null, // Pasillo
    "PT", // Puerta trasera (derecha)
    null, // Espacio
  ]);
  
  // Fila 15: Últimos 3 asientos (53-55) centrados
  seatRows.push([
    53,   // Izquierda 1
    54,   // Centro
    55,   // Derecha 1
    null, // Espacio
    null, // Espacio
  ]);
  
  return seatRows;
};

// Para impresión B/N: asientos ocupados = trama + texto blanco, libres = borde sólido solo
export function BusSeatMapPrint({ passengers }: { passengers: Passenger[] }) {
  const getPassengerBySeat = (seat: number) =>
    passengers.find((p) => p.seat === seat);

  const seatMap = buildSeatLayout();

  return (
    <div className="flex flex-col items-center bg-white p-1 print:bg-white print:p-0 rounded-xl w-fit max-w-full">
      <span className="block text-center text-[12px] print:text-[10px] font-bold mb-0.5">
        Croquis bus (vista superior)
      </span>
      <div
        className="bg-white border border-black rounded-lg px-1 py-1 print:shadow-none print:border flex flex-col"
        style={{ minWidth: 180, maxWidth: "100%" }}
      >
        <div
          className="flex flex-col gap-[1px] print:gap-[1px]"
          style={{
            width: "200px",
            minWidth: "200px",
            maxWidth: "100%",
            background: "#fff"
          }}
        >
          {seatMap.map((row, rowIdx) => (
            <div key={rowIdx} className="flex flex-row gap-[1px] print:gap-[1px]">
              {row.map((cell, colIdx) => {
                // Conductor
                if (cell === "C") {
                  return (
                    <div
                      key="conductor"
                      className="w-5 h-5 print:w-4 print:h-4 rounded-[2px] flex items-center justify-center font-extrabold border border-black text-[7px] print:text-[7px] bg-gray-700 text-white"
                      style={{ fontSize: "8px", padding: 0 }}
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
                      className="w-5 h-5 print:w-4 print:h-4 flex items-center justify-center border border-black text-[7px] print:text-[7px] bg-white"
                      style={{ fontSize: "8px", padding: 0 }}
                      title={cell === "PD" ? "Puerta delantera" : "Puerta trasera"}
                    >
                      <span className="block w-full border-b-2 border-dashed border-black" style={{ height: 7 }} />
                    </div>
                  );
                }
                // Pasillo/espacio
                if (cell === null) {
                  return <div key={"espacio-" + colIdx + "-" + rowIdx} className="w-3 print:w-2" />;
                }
                // Asientos normales
                const seatNum = Number(cell);
                const ocupado = getPassengerBySeat(seatNum);
                return (
                  <div
                    key={seatNum}
                    className={cn(
                      "w-5 h-5 print:w-4 print:h-4 rounded-[2px] flex items-center justify-center font-bold border border-black text-[10px] print:text-[8px] box-content",
                      ocupado
                        ? "text-white border-2 border-black"
                        : "text-black border-2 border-black"
                    )}
                    style={{
                      background:
                        ocupado
                          ? "repeating-linear-gradient(-45deg, #222 0 2px, #fff 2px 4px)"
                          : "none"
                    }}
                  >
                    {seatNum}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Leyenda */}
        <div className="mt-0.5 flex flex-row justify-center gap-1.5 w-full print:text-[8px]">
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
          <div
            className="ml-1 w-3 h-3 border border-black rounded-sm bg-gray-700 inline-block"
          />{" "}
          <span className="text-[8px]">Conductor</span>
          <div
            className="ml-1 w-3 h-3 border border-black rounded-sm inline-block"
          >
            <span className="block w-full border-b-2 border-dashed border-black" style={{ height: 7 }} />
          </div>
          <span className="text-[8px]">Puerta</span>
        </div>
        <span className="block text-[7px] text-center text-gray-500 mt-0.5">Vista superior — FRENTE arriba</span>
      </div>
    </div>
  );
}
