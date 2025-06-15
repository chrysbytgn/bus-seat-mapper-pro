
import React from "react";
import { Passenger } from "./BusSeatMap";
import { cn } from "@/lib/utils";

// Nueva lógica para crear el layout correcto del autobús de 55 plazas
// Conductor arriba a la izquierda, puerta delantera, puerta trasera después de la fila 10, última fila de 5
const buildSeatLayout = () => {
  const seatRows: (number | string | null)[][] = [];

  // Fila delantera: conductor + puerta delantera + 2 asientos (1, 2)
  seatRows.push([
    "C",       // Conductor
    "PD",      // Puerta Del.
    1,
    2
  ]);

  let currentSeat = 3;
  // Filas intermedias: filas 2 a 10 (8 filas más), cada una: 2+pasillo+2
  for (let i = 0; i < 9; i++) {
    seatRows.push([
      currentSeat,
      currentSeat + 1,
      null,      // Pasillo
      currentSeat + 2,
      currentSeat + 3,
    ]);
    currentSeat += 4;
  }

  // Puerta trasera tras la fila de asientos 19-20 (es decir, tras la fila 10, asientos 19 y 20)
  // Fila actual contiene asientos 19, 20, 21, 22 (currentSeat = 39 tras esto)
  seatRows.push([
    currentSeat,
    currentSeat + 1,
    null,
    currentSeat + 2,
    currentSeat + 3,
  ]);
  currentSeat += 4;

  // Fila de puerta trasera (puerta trasera ocupa el pasillo central)
  seatRows.push([
    null,
    null,
    "PT", // Puerta Tras.
    null,
    null,
  ]);

  // Filas siguientes hasta asiento 50 (del 23 al 50)
  for (let i = 0; i < 7; i++) {
    seatRows.push([
      currentSeat,
      currentSeat + 1,
      null,
      currentSeat + 2,
      currentSeat + 3,
    ]);
    currentSeat += 4;
  }
  // Si nos pasamos de 50, rellenar nulls
  if (currentSeat > 51) {
    seatRows[seatRows.length-1] = seatRows[seatRows.length-1].map(s => (typeof s === 'number' && s > 50) ? null : s);
  }

  // Última fila: 5 asientos juntos (51-55)
  seatRows.push([51, 52, 53, 54, 55]);

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
                // Puerta delantera
                if (cell === "PD") {
                  return (
                    <div
                      key="puerta-del"
                      className="w-5 h-5 print:w-4 print:h-4 flex items-center justify-center border border-black text-[7px] print:text-[7px] bg-white"
                      style={{ fontSize: "8px", padding: 0 }}
                      title="Puerta delantera"
                    >
                      <span className="block w-full border-b-2 border-dashed border-black" style={{ height: 7 }} />
                    </div>
                  );
                }
                // Puerta trasera
                if (cell === "PT") {
                  return (
                    <div
                      key="puerta-tras"
                      className="w-5 h-5 print:w-4 print:h-4 flex items-center justify-center border border-black text-[7px] print:text-[7px] bg-white"
                      style={{ fontSize: "8px", padding: 0 }}
                      title="Puerta trasera"
                    >
                      <span className="block w-full border-b-2 border-dashed border-black" style={{ height: 7 }} />
                    </div>
                  );
                }
                // Pasillo
                if (cell === null) {
                  return <div key={"pasillo-" + colIdx} className="w-3 print:w-2" />;
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
