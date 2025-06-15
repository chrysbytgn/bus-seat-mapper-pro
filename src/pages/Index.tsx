
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BusSeatMap, Passenger } from "@/components/BusSeatMap";
import { PassengerList } from "@/components/PassengerList";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const PASSENGERS_KEY_PREFIX = "excursion_passengers_";
const EXCURSIONS_KEY = "excursions";

export type ExcursionData = {
  id: string;
  name: string;
  date?: string;
  time?: string;
  place?: string;
};

const Index = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [excursionInfo, setExcursionInfo] = useState<ExcursionData | null>(null);

  // Carga datos de la excursión
  useEffect(() => {
    if (!id) return;
    const excursions = window.localStorage.getItem(EXCURSIONS_KEY);
    if (excursions) {
      try {
        const arr = JSON.parse(excursions);
        const found = arr.find((e: any) => e.id === id);
        if (found) {
          setExcursionInfo({
            id: found.id,
            name: found.name,
            date: found.date,
            time: found.time,
            place: found.place,
          });
        }
      } catch (e) {
        setExcursionInfo(null);
      }
    }
  }, [id]);

  // Load passengers by excursion id
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    const saved = window.localStorage.getItem(PASSENGERS_KEY_PREFIX + id);
    setPassengers(saved ? JSON.parse(saved) : []);
  }, [id, navigate]);

  // Save passengers on update
  useEffect(() => {
    if (id) {
      window.localStorage.setItem(PASSENGERS_KEY_PREFIX + id, JSON.stringify(passengers));
    }
  }, [passengers, id]);

  const handleAddOrEditPassenger = (seat: number, name: string, surname: string) => {
    setPassengers(prev => {
      const exists = prev.some(p => p.seat === seat);
      if (exists) {
        return prev.map(p => p.seat === seat ? { seat, name, surname } : p);
      }
      return [...prev, { seat, name, surname }];
    });
  };

  const handleClearSeats = () => {
    setPassengers([]);
  };

  // Quitamos botones de guardar y volver atrás según indicación

  return (
    <div className="flex min-h-screen w-full bg-background flex-col">
      <main className="flex flex-1 flex-col lg:flex-row gap-8 items-start py-12">
        <section className="flex-1 min-w-[380px]">
          <BusSeatMap
            passengers={passengers}
            onSeatClick={handleAddOrEditPassenger}
            excursionName={excursionInfo?.name || "Excursión"}
          />
        </section>
        <aside className="flex-1 min-w-[340px]">
          <PassengerList
            passengers={passengers}
            onClear={handleClearSeats}
            excursionInfo={excursionInfo}
          />
        </aside>
      </main>
    </div>
  );
};

export default Index;
