import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  fetchExcursionById,
  fetchPassengers,
  upsertPassenger,
  clearPassengers,
  upsertExcursion,
  deleteExcursion,
} from "@/utils/supabasePassengers";
import { ExcursionData } from "@/pages/Index";

export function useExcursion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState<any[]>([]);
  const [excursionInfo, setExcursionInfo] = useState<ExcursionData | null>(null);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loadingExcursion, setLoadingExcursion] = useState(true);
  const [excursionError, setExcursionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      console.log("No excursion ID provided");
      setLoadingExcursion(false);
      setExcursionError("ID de excursión no válido");
      return;
    }
    
    const excursionId = Number(id);
    if (isNaN(excursionId)) {
      console.log("Invalid excursion ID:", id);
      setLoadingExcursion(false);
      setExcursionError("ID de excursión no válido");
      return;
    }
    
    console.log("Loading excursion with ID:", excursionId);
    setLoadingExcursion(true);
    setExcursionError(null);
    
    fetchExcursionById(excursionId)
      .then(data => {
        console.log("Excursion fetched:", data);
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
            } catch {
              console.log("Could not parse stops as JSON");
            }
          } else if (stopsRaw && typeof stopsRaw === "object") {
            parsedStops = Object.values(stopsRaw).filter((v): v is string => typeof v === "string");
          }
          
          const excursionData = {
            id: Number(data.id),
            name: data.name,
            date: data.date || "",
            time: data.time || "",
            place: data.place || "",
            stops: parsedStops,
            price: data.price || "",
            association_id: data.association_id,
            available_seats: data.available_seats || 55,
          };
          
          console.log("Setting excursion info:", excursionData);
          setExcursionInfo(excursionData);
        } else {
          console.log("No excursion data found for ID:", excursionId);
          setExcursionInfo(null);
          setExcursionError("No se encontró la excursión solicitada. Es posible que no exista o haya sido eliminada.");
        }
      })
      .catch((err) => {
        console.error("Error loading excursion:", err);
        setExcursionInfo(null);
        setExcursionError("Error al cargar la excursión. Intenta actualizar la página o vuelve atrás.");
      })
      .finally(() => {
        console.log("Finished loading excursion");
        setLoadingExcursion(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id || !excursionInfo?.id) {
      console.log("Skipping passenger fetch - no excursion ID");
      setPassengers([]);
      return;
    }
    
    const excursionId = Number(id);
    console.log("Loading passengers for excursion:", excursionId);
    fetchPassengers(excursionId)
      .then((data) => {
        console.log("Passengers loaded:", data);
        setPassengers(data);
      })
      .catch((err) => {
        console.error("Error loading passengers:", err);
        setPassengers([]);
      });
  }, [id, excursionInfo?.id]);

  const handleAddOrEditPassenger = useCallback(async (seat: number, name: string, surname: string, phone: string = "") => {
    if (!id || !excursionInfo?.id) {
      toast({
        title: "Excursión no encontrada",
        description: "No se pudo guardar el pasajero porque la excursión aún no está disponible.",
        variant: "destructive"
      });
      return;
    }
    try {
      const excursionId = Number(id);
      await upsertPassenger(excursionId, { seat, name, surname, phone });
      fetchPassengers(excursionId).then(setPassengers);
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
  }, [id, excursionInfo?.id]);

  const handleClearSeats = useCallback(async () => {
    if (!id || !excursionInfo?.id) return;
    try {
      const excursionId = Number(id);
      await clearPassengers(excursionId);
      setPassengers([]);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudieron borrar los pasajeros.",
        variant: "destructive"
      });
      console.error("Error limpiando asientos:", err);
    }
  }, [id, excursionInfo?.id]);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleSave = useCallback(() => {
    toast({
      title: "Guardado",
      description: "Los cambios de los pasajeros han sido guardados.",
      duration: 2200,
    });
  }, []);

  const handleEditExcursion = useCallback(async (data: ExcursionData) => {
    if (!excursionInfo?.association_id || !id) return;
    try {
      const excursionId = Number(id);
      await upsertExcursion({
        ...data,
        id: excursionId,
        association_id: excursionInfo.association_id,
      });
      setExcursionInfo((prev) => prev ? { ...prev, ...data, id: excursionId } : prev);
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
  }, [excursionInfo?.association_id, id]);

  const handleDeleteExcursion = useCallback(async () => {
    if (!id || !excursionInfo?.id) return;
    try {
      const excursionId = Number(id);
      await deleteExcursion(excursionId);
      toast({
        title: "Excursión eliminada",
        description: "La excursión ha sido eliminada correctamente.",
        duration: 2200,
      });
      navigate("/");
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la excursión.",
        variant: "destructive"
      });
      console.error("Error eliminando excursión:", err);
    }
  }, [id, excursionInfo?.id, navigate]);

  return {
    passengers,
    excursionInfo,
    showReceiptsModal,
    setShowReceiptsModal,
    editDialogOpen,
    setEditDialogOpen,
    loadingExcursion,
    excursionError,
    handleAddOrEditPassenger,
    handleClearSeats,
    handleBack,
    handleSave,
    handleEditExcursion,
    handleDeleteExcursion,
  };
}
