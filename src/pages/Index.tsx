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
import { ExcursionHeader } from "@/components/ExcursionHeader";
import { ExcursionMain } from "@/components/ExcursionMain";
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
  const [loadingExcursion, setLoadingExcursion] = useState(true);
  const [excursionError, setExcursionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoadingExcursion(true);
    setExcursionError(null);
    fetchExcursionById(Number(id))
      .then(data => {
        if (data && data.id) {
          let parsedStops: string[] = [];
          const stopsRaw = data.stops;
          if (Array.isArray(stopsRaw)) {
            parsedStops = stopsRaw.filter((v): v is string => typeof v === "string");
          } else if (typeof stopsRaw === "string") {
            try {
              const asParsed = JSON.parse(stopsRaw);
              if (Array.isArray(asParsed)) {
                parsedStops = asParsed.filter((v: unknown): v is string => typeof v === "string");
              } else if (asParsed && typeof asParsed === "object") {
                parsedStops = Object.values(asParsed).filter((v): v is string => typeof v === "string");
              }
            } catch {}
          } else if (stopsRaw && typeof stopsRaw === "object") {
            parsedStops = Object.values(stopsRaw).filter((v): v is string => typeof v === "string");
          }
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
        } else {
          setExcursionInfo(null);
          setExcursionError("No se encontró la excursión solicitada. Vuelve atrás y selecciona otra.");
        }
      })
      .catch((err) => {
        setExcursionInfo(null);
        setExcursionError("Error al cargar la excursión. Intenta actualizar la página o vuelve atrás.");
        console.error("Error cargando excursión:", err);
      })
      .finally(() => setLoadingExcursion(false));
  }, [id]);

  useEffect(() => {
    if (!id || !excursionInfo?.id) {
      setPassengers([]);
      return;
    }
    fetchPassengers(Number(id))
      .then((data) => setPassengers(data))
      .catch((err) => {
        setPassengers([]);
        console.error("Error cargando pasajeros:", err);
      });
  }, [id, excursionInfo?.id]);

  const handleAddOrEditPassenger = async (seat: number, name: string, surname: string) => {
    if (!id || !excursionInfo?.id) {
      toast({
        title: "Excursión no encontrada",
        description: "No se pudo guardar el pasajero porque la excursión aún no está disponible.",
        variant: "destructive"
      });
      return;
    }
    try {
      await upsertPassenger(Number(id), { seat, name, surname });
      fetchPassengers(Number(id)).then(setPassengers);
    } catch (error: any) {
      if (error && typeof error.message === "string" && error.message.includes("foreign key constraint")) {
        toast({
          title: "Error de integridad",
          description: "No se pudo guardar el pasajero, la excursión no existe o fue eliminada.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar el pasajero.",
          variant: "destructive"
        });
      }
      console.error("Error guardando pasajero:", error);
    }
  };

  const handleClearSeats = async () => {
    if (!id || !excursionInfo?.id) return;
    try {
      await clearPassengers(Number(id));
      setPassengers([]);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudieron borrar los pasajeros.",
        variant: "destructive"
      });
      console.error("Error limpiando asientos:", err);
    }
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
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la excursión.",
        variant: "destructive"
      });
      console.error("Error editando excursión:", err);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background flex-col">
      {/* CABECERA */}
      <ExcursionHeader
        loadingExcursion={loadingExcursion}
        excursionInfo={excursionInfo}
        onBack={handleBack}
        onSave={handleSave}
        onShowReceipts={() => setShowReceiptsModal(true)}
        onEditExcursion={() => setEditDialogOpen(true)}
        passengersCount={passengers.length}
      />
      {/* CONTENIDO PRINCIPAL */}
      <ExcursionMain
        passengers={passengers}
        excursionInfo={excursionInfo}
        loadingExcursion={loadingExcursion}
        excursionError={excursionError}
        onClearSeats={handleClearSeats}
        onSeatClick={handleAddOrEditPassenger}
        onBack={handleBack}
      />
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
