
import { Passenger } from "./BusSeatMap";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { toast } from "sonner";
import { Bus } from "lucide-react";

interface PassengerListProps {
  passengers: Passenger[];
  onClear: () => void;
}

export function PassengerList({ passengers, onClear }: PassengerListProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    toast("¡Lista de pasajeros enviada a imprimir!");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Bus className="text-primary" size={28} />
        <h2 className="text-xl font-bold">Lista de pasajeros</h2>
      </div>
      <div className="bg-white border rounded-lg shadow p-4 mb-2 max-h-[540px] overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-2 py-1"># Asiento</th>
              <th className="text-left px-2 py-1">Nombre</th>
              <th className="text-left px-2 py-1">Apellido</th>
            </tr>
          </thead>
          <tbody>
            {passengers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-400">Ningún pasajero ingresado</td>
              </tr>
            ) : (
              passengers
                .sort((a, b) => a.seat - b.seat)
                .map(p => (
                  <tr key={p.seat}>
                    <td className="px-2 py-1 font-semibold">{p.seat}</td>
                    <td className="px-2 py-1">{p.name}</td>
                    <td className="px-2 py-1">{p.surname}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onClear}>Limpiar asientos</Button>
        <Button size="sm" onClick={handlePrint}>Imprimir informe</Button>
      </div>
    </div>
  );
}
