
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BusSeatMap, Passenger } from "@/components/BusSeatMap";
import { PassengerList } from "@/components/PassengerList";

const PASSENGERS_KEY_PREFIX = "excursion_passengers_";
const EXCURSIONS_KEY = "excursions";

const Index = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [excursionName, setExcursionName] = useState<string>("Excursión");

  // Cargar nombre de la excursión
  useEffect(() => {
    if (!id) return;
    const excursions = window.localStorage.getItem(EXCURSIONS_KEY);
    if (excursions) {
      try {
        const arr = JSON.parse(excursions);
        const found = arr.find((e: any) => e.id === id);
        if (found && found.name) setExcursionName(found.name);
      } catch (e) {
        setExcursionName("Excursión");
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

  return (
    <div className="flex min-h-screen w-full bg-background">
      <main className="flex flex-1 flex-col lg:flex-row gap-8 items-start py-12">
        <section className="flex-1 min-w-[380px]">
          <BusSeatMap
            passengers={passengers}
            onSeatClick={handleAddOrEditPassenger}
            excursionName={excursionName}
          />
        </section>
        <aside className="flex-1 min-w-[340px]">
          <PassengerList
            passengers={passengers}
            onClear={handleClearSeats}
          />
        </aside>
      </main>
    </div>
  );
};

export default Index;
