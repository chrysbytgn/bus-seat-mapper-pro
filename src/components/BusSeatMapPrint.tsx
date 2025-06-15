
import React from "react";
import { Passenger } from "./BusSeatMap";
import { cn } from "@/lib/utils";

// Croquis SOLO para impresión, con el lado izquierdo desplazado arriba una fila
export function BusSeatMapPrint({ passengers }: { passengers: Passenger[] }) {
  // Estructura igual al BusSeatMap, pero desplazamos SOLO la columna izquierda (asientos [0] de cada fila) hacia arriba una fila

  // Preparamos la distribución básica
  let currentSeat = 1;
  const ROWS = 13;
  const baseSeatRows: (number | null)[][] = [];

  for (let row = 0; row < ROWS; row++) {
    const seatsInRow: (number | null)[] = [];
    // Izquierda
    for (let col = 0; col < 2; col++) {
      if (currentSeat <= 50) {
        seatsInRow.push(currentSeat++);
      } else {
        seatsInRow.push(null);
      }
    }
    // Pasillo
    seatsInRow.push(null);
    // Derecha
    for (let col = 0; col < 2; col++) {
      if (currentSeat <= 50) {
        seatsInRow.push(currentSeat++);
      } else {
        seatsInRow.push(null);
      }
    }
    baseSeatRows.push(seatsInRow);

    if (row === 4) {
      // Fila especial debajo de la 5 (pasillo grande)
      baseSeatRows.push([null, null, null, null, null]);
    }
  }

  // Adelantar SOLO el asiento 21 como en el mapa base
  let idx21 = baseSeatRows.findIndex((row) => row[0] === 21);
  if (idx21 > 0) {
    const temp = baseSeatRows[idx21 - 1][0];
    baseSeatRows[idx21 - 1][0] = 21;
    baseSeatRows[idx21][0] = temp;
  }
  // Agregamos la última fila de 5 asientos
  baseSeatRows.push([51, 52, 53, 54, 55]);

  // Aquí aplicamos el DESPLAZAMIENTO: todos los asientos del lado izquierdo (columna 0) suben 1 fila (excepto primera)
  const seatRows = baseSeatRows.map((row) => [...row]);
  for (let i = 1; i < seatRows.length; i++) {
    seatRows[i - 1][0] = baseSeatRows[i][0];
  }
  // El primer asiento de la última fila (fila de 5) recibe null en la columna 0 (ya que no hay fila siguiente)
  seatRows[seatRows.length - 1][0] = null;

  // Resto del croquis: pintar asientos ocupados
  const getPassengerBySeat = (seat: number) =>
    passengers.find((p) => p.seat === seat);

  return (
    <div className="w-[65px] h-[120px] print:w-[52px] print:h-[107mm] print:mx-auto print:my-2 print:scale-[0.7] print:overflow-hidden flex flex-col items-center">
      <span className="block text-center text-[12px] print:text-xs font-bold mb-0">Croquis bus</span>
      <div className="w-full h-full bg-gray-200 border-2 border-gray-400 rounded-xl flex flex-col items-center justify-center px-1 py-2">
        {/* Renderizado del croquis de asientos */}
        <div className="flex flex-col gap-[2.5px] w-full items-center mt-1">
          {seatRows.map((row, rowIdx) => (
            row.every((s) => s === null) ? (
              // Fila pasillo grande
              <div key={"pasillo-"+rowIdx} className="w-full h-[7px] print:h-[7px]" />
            ) : (
              <div key={rowIdx} className="flex flex-row justify-center items-center gap-[3px]">
                {row.map((seat, colIdx) => seat === null ? (
                  <div
                    key={colIdx}
                    className={colIdx === 2 ? "w-[8px]" : "w-[6px]"} // pasillo más ancho al centro
                  />
                ) : (
                  <div
                    key={seat}
                    className={cn(
                      "w-[15px] h-[14px] print:w-[12px] print:h-[11px] rounded-[3px] flex items-center justify-center font-bold text-[8px] border border-gray-500 select-none",
                      getPassengerBySeat(seat)
                        ? "bg-red-400 text-white border-red-500"
                        : "bg-green-400 text-white border-green-500"
                    )}
                    aria-label={`Asiento ${seat}`}
                  >{seat}</div>
                ))}
              </div>
            )
          ))}
        </div>
        {/* Leyenda */}
        <div className="mt-1 flex flex-row justify-center gap-1 w-full">
          <div className="w-3 h-3 bg-green-400 border border-green-500 rounded-sm" />
          <span className="text-[8px]">Libre</span>
          <div className="mx-1 w-3 h-3 bg-red-400 border border-red-500 rounded-sm" />
          <span className="text-[8px]">Ocup.</span>
        </div>
      </div>
    </div>
  );
}

