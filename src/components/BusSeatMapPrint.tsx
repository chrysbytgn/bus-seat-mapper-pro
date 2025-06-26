
import React from "react";
import { Passenger } from "./BusSeatMap";
import { cn } from "@/lib/utils";
import { Book } from "lucide-react";

/**
 * Layout unificado para impresión - IDÉNTICO al de BusSeatMap.tsx
 * Croquis de bus 55 plazas con layout mejorado:
 * - Conductor (izquierda) + Guía/Líder (derecha) + Puerta principal al lado del guía
 * - Filas 1-7: Asientos 01-28 (4 por fila)
 * - Fila especial: Asientos 29-30 (izquierda) + Puerta trasera (derecha, detrás de 27-28)
 * - Filas intermedias: Asientos 31-50
 * - Fila final: Asientos 51-55 (todos en una sola fila)
 */
const buildSeatLayout = () => {
  const seatRows: (number | string | null)[][] = [];
  
  // Fila 0: Conductor + Guía + Puerta principal al lado del guía
  seatRows.push([
    "C",    // Conductor
    null,   // Espacio
    null,   // Pasillo central
    "G",    // Guía/Líder
    "P",    // Puerta principal al lado del guía
  ]);
  
  // Filas 1-7: Asientos 01-28 (7 filas × 4 asientos = 28 asientos)
  let currentSeat = 1;
  for (let fila = 0; fila < 7; fila++) {
    seatRows.push([
      currentSeat,     // Izquierda 1
      currentSeat + 1, // Izquierda 2
      null,            // Pasillo
      currentSeat + 2, // Derecha 1
      currentSeat + 3, // Derecha 2
    ]);
    currentSeat += 4;
  }
  
  // Fila especial: Asientos 29-30 (izquierda) + Puerta trasera (derecha, detrás de 27-28)
  seatRows.push([
    29,     // Asiento 29 (izquierda, detrás de 25)
    30,     // Asiento 30 (izquierda, detrás de 26)
    null,   // Pasillo
    "PT",   // Puerta trasera (derecha, detrás de 27)
    "PT",   // Puerta trasera (derecha, detrás de 28)
  ]);
  
  // Filas intermedias: Asientos 31-50 (5 filas × 4 asientos = 20 asientos)
  currentSeat = 31;
  for (let fila = 0; fila < 5; fila++) {
    seatRows.push([
      currentSeat,     // Izquierda 1
      currentSeat + 1, // Izquierda 2
      null,            // Pasillo
      currentSeat + 2, // Derecha 1
      currentSeat + 3, // Derecha 2
    ]);
    currentSeat += 4;
  }
  
  // Fila final: Asientos 51-55 (todos en una sola fila)
  seatRows.push([
    51,     // Asiento 51
    52,     // Asiento 52
    53,     // Asiento 53 (centro)
    54,     // Asiento 54
    55,     // Asiento 55
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
                // Guía/Líder
                if (cell === "G") {
                  return (
                    <div
                      key="guia"
                      className="w-5 h-5 print:w-4 print:h-4 rounded-[2px] flex items-center justify-center font-extrabold border border-black bg-gray-500 text-white"
                      style={{ fontSize: "6px", padding: 0 }}
                      title="Guía/Líder"
                    >
                      <Book size={10} />
                    </div>
                  );
                }
                // Puertas
                if (cell === "P" || cell === "PT") {
                  return (
                    <div
                      key={cell + "-" + colIdx}
                      className="w-5 h-3 print:w-4 print:h-2 flex items-center justify-center border border-black text-[6px] print:text-[5px] bg-white"
                      style={{ fontSize: "5px", padding: 0 }}
                      title={cell === "P" ? "Puerta principal" : "Puerta trasera"}
                    >
                      <span className="font-bold">PUERTA</span>
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
                    {seatNum.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Leyenda mejorada */}
        <div className="mt-0.5 flex flex-row justify-center gap-1.5 w-full print:text-[8px] flex-wrap">
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
          />
          <span className="text-[8px]">Conductor</span>
          <div
            className="ml-1 w-3 h-3 border border-black rounded-sm bg-gray-500 inline-block flex items-center justify-center"
          >
            <Book size={8} className="text-white" />
          </div>
          <span className="text-[8px]">Guía</span>
          <div
            className="ml-1 w-3 h-2 border border-black rounded-sm inline-block bg-white flex items-center justify-center"
          >
            <span className="text-[4px] font-bold">P</span>
          </div>
          <span className="text-[8px]">Puerta</span>
        </div>
        <span className="block text-[7px] text-center text-gray-500 mt-0.5">Vista superior — FRENTE arriba</span>
      </div>
    </div>
  );
}
