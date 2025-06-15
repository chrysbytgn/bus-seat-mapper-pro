
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BusSeatMap, Passenger } from "@/components/BusSeatMap";
import { PassengerList } from "@/components/PassengerList";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Edit2 } from "lucide-react";
import { SeatReceiptsModal } from "@/components/SeatReceiptsModal";
import { ExcursionPrintReport } from "@/components/ExcursionPrintReport";
import { EditExcursionDialog } from "@/components/EditExcursionDialog";
import {
  fetchAssociation,
  fetchExcursionById,
  fetchPassengers,
  upsertPassenger,
  clearPassengers,
  upsertExcursion // ADD THE IMPORT
} from "@/utils/supabasePassengers";

const PASSENGERS_KEY_PREFIX = "excursion_passengers_";
const EXCURSIONS_KEY = "excursions";

export type ExcursionData = {
  id: number; // It is number (matches db), not string
  name: string;
  date?: string;
  time?: string;
  place?: string;
  stops?: string[];
  price?: string;
  association_id?: string;
};

const Index = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [excursionInfo, setExcursionInfo] = useState<ExcursionData | null>(null);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchExcursionById(Number(id)) // always pass number
      .then(data => {
        if (data) {
          let parsedStops: string[] = [];
          if (Array.isArray(data.stops)) {
            parsedStops = data.stops as string[];
          } else if (typeof data.stops === "string") {
            try {
              const asParsed = JSON.parse(data.stops);
              if (Array.isArray(asParsed)) parsedStops = asParsed;
            } catch {}
          } else if (data.stops && typeof data.stops === "object" && Array.isArray((data.stops as any))) {
            parsedStops = data.stops as string[];
          } // else leave as []
          setExcursionInfo({
            id: Number(data.id),
            name: data.name,
            date: data.date || "",
            time: data.time || "",
            place: data.place || "",
            stops: parsedStops,
            price: data.price || "",
            association_id: data.association_id,
          });
        }
      })
      .catch(() => setExcursionInfo(null));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchPassengers(Number(id)) // pass number type
      .then((data) => setPassengers(data))
      .catch(() => setPassengers([]));
  }, [id]);

  const handleAddOrEditPassenger = async (seat: number, name: string, surname: string) => {
    if (!id) return;
    try {
      await upsertPassenger(Number(id), { seat, name, surname });
      fetchPassengers(Number(id)).then(setPassengers);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar el pasajero.",
        variant: "destructive"
      });
    }
  };

  const handleClearSeats = async () => {
    if (!id) return;
    await clearPassengers(Number(id));
    setPassengers([]);
  };

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

  const handleEditExcursion = async (data: ExcursionData) => {
    if (!excursionInfo?.association_id || !id) return;
    try {
      await upsertExcursion({
        ...data,
        id: Number(id),
        association_id: excursionInfo.association_id,
      });
      setExcursionInfo((prev) => prev ? { ...prev, ...data, id: Number(id) } : prev);
      setEditDialogOpen(false);
      toast({
        title: "Excursión modificada",
        description: "La información de la excursión se ha actualizado.",
        duration: 2200,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar la excursión.",
        variant: "destructive"
      });
    }
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
            title="Editar información de la excursión"
          >
            <Edit2 className="mr-1" /> Editar excursión
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
      <EditExcursionDialog
        open={editDialogOpen}
        excursion={excursionInfo}
        onCancel={() => setEditDialogOpen(false)}
        onSave={handleEditExcursion}
      />
    </div>
  );
};

export default Index;
