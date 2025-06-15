import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BusSeatMap, Passenger } from "@/components/BusSeatMap";
import { PassengerList } from "@/components/PassengerList";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { SeatReceiptsModal } from "@/components/SeatReceiptsModal";
import { ExcursionPrintReport } from "@/components/ExcursionPrintReport";

const PASSENGERS_KEY_PREFIX = "excursion_passengers_";
const EXCURSIONS_KEY = "excursions";

export type ExcursionData = {
  id: string;
  name: string;
  date?: string;
  time?: string;
  place?: string;
  stops?: string[]; // Añadido ya para paradas
  price?: string;   // Añadido para precio
};

const Index = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [excursionInfo, setExcursionInfo] = useState<ExcursionData | null>(null);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);

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
            stops: found.stops || [],
            price: found.price || "", // soportar precio en excursión vieja/nueva
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

  // NUEVO: manejo para botón guardar y volver atrás
  const handleBack = () => {
    navigate("/");
  };

  const handleSave = () => {
    toast({
      title: "Guardado",
      description: "Los cambios de los pasajeros han sido guardados.",
      duration: 2200,
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background flex-col">
      {/* Fila de botones arriba */}
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full px-4 pt-8 gap-3 print:hidden">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-1" />
          Volver atrás
        </Button>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="mr-1" />
            Guardar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowReceiptsModal(true)}
            disabled={passengers.length === 0}
            title={passengers.length === 0 ? "Debes agregar pasajeros para generar recibos" : undefined}
          >
            Generar recibos
          </Button>
        </div>
      </div>
      {/* CONTENIDO NORMAL */}
      <main className="flex flex-1 flex-col lg:flex-row gap-8 items-start py-12 print:hidden">
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
      {/* INFORME PARA IMPRIMIR */}
      <div className="hidden print:block print:w-full">
        <ExcursionPrintReport passengers={passengers} excursionInfo={excursionInfo} />
      </div>
      <SeatReceiptsModal
        open={showReceiptsModal}
        onClose={() => setShowReceiptsModal(false)}
        passengers={passengers}
        excursionInfo={excursionInfo}
      />
    </div>
  );
};

export default Index;
