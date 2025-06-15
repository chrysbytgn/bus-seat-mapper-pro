import React from "react";
import { Passenger } from "./BusSeatMap";
import { cn } from "@/lib/utils";

// Genera el layout exacto de un autobús de 55 plazas como en el estándar
const buildSeatLayout = () => {
  const seatRows: (number | string | null)[][] = [];

  // Fila 0: Conductor, Puerta Delantera, Asiento 1, Asiento 2
  seatRows.push([
    "C",   // Conductor
    "PD",  // Puerta delantera
    1,
    2,
  ]);

  // Filas 1-9: asientos del 3 al 38 (2+pasillo+2), 9 filas
  let currentSeat = 3;
  for (let i = 0; i < 9; i++) {
    seatRows.push([
      currentSeat,
      currentSeat + 1,
      null, // pasillo
      currentSeat + 2,
      currentSeat + 3,
    ]);
    currentSeat += 4;
  }

  // Fila puerta trasera (tras asientos 19,20): fila vacía y puerta centrada
  // La última fila de arriba termina en asiento 38, pero la puerta va después de la fila con asientos 19-20
  // Esto ya está cubierto correctamente porque currentSeat después de la décima fila será 39
  seatRows.splice(6, 0, [
    null, null, "PT", null, null,
  ]); // Insertamos justo después de la fila con asientos 19-22

  // Siguiente: continuar con 7 filas normales (del asiento actual hasta el asiento 50)
  while (currentSeat <= 50) {
    seatRows.push([
      currentSeat,
      currentSeat + 1,
      null,
      currentSeat + 2,
      currentSeat + 3,
    ]);
    currentSeat += 4;
  }
  // En la última fila de este bucle, puede que sobren celdas porque se pasa de 50
  seatRows[seatRows.length - 1] = seatRows[seatRows.length - 1].map(
    (s) => (typeof s === "number" && s > 50 ? null : s)
  );

  // Fila final: 5 asientos juntos (51-55)
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
