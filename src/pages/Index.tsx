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
import { useExcursion } from "@/hooks/useExcursion";

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
  const {
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
  } = useExcursion();

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
