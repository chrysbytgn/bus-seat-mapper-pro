
import { BusSeatMap, Passenger } from "@/components/BusSeatMap";
import { PassengerList } from "@/components/PassengerList";
import { Button } from "@/components/ui/button";

interface ExcursionMainProps {
  passengers: Passenger[];
  excursionInfo: any;
  loadingExcursion: boolean;
  excursionError: string | null;
  onClearSeats: () => void;
  onSeatClick: (seat: number, name: string, surname: string) => void;
  onBack: () => void;
}

export function ExcursionMain({
  passengers,
  excursionInfo,
  loadingExcursion,
  excursionError,
  onClearSeats,
  onSeatClick,
  onBack,
}: ExcursionMainProps) {
  return (
    <main className="flex flex-1 flex-col lg:flex-row gap-8 items-start py-12 print:hidden">
      <section className="flex-1 min-w-[380px]">
        {excursionError ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500 font-semibold">
            {excursionError}
            <Button className="mt-4" onClick={onBack}>Volver</Button>
          </div>
        ) : !excursionInfo || loadingExcursion ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            Cargando excursión...
          </div>
        ) : (
          <BusSeatMap
            passengers={passengers}
            onSeatClick={onSeatClick}
            excursionName={excursionInfo?.name || "Excursión"}
            availableSeats={excursionInfo?.available_seats || 55}
          />
        )}
      </section>
      <aside className="flex-1 min-w-[340px]">
        {excursionError ? (
          <div className="flex flex-col items-center justify-center h-48 text-red-500 font-semibold">
            {excursionError}
          </div>
        ) : !excursionInfo || loadingExcursion ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            Información no disponible.
          </div>
        ) : (
          <PassengerList
            passengers={passengers}
            onClear={onClearSeats}
            excursionInfo={excursionInfo}
          />
        )}
      </aside>
    </main>
  );
}
