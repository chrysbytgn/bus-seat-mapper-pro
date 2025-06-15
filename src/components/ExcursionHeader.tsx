
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Edit2 } from "lucide-react";

interface ExcursionHeaderProps {
  loadingExcursion: boolean;
  excursionInfo: any;
  onBack: () => void;
  onSave: () => void;
  onShowReceipts: () => void;
  onEditExcursion: () => void;
  passengersCount: number;
}

export function ExcursionHeader({
  loadingExcursion,
  excursionInfo,
  onBack,
  onSave,
  onShowReceipts,
  onEditExcursion,
  passengersCount,
}: ExcursionHeaderProps) {
  return (
    <div className="flex justify-between items-center max-w-5xl mx-auto w-full px-4 pt-8 gap-3 print:hidden">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1" />
        Volver atrás
      </Button>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={loadingExcursion || !excursionInfo?.id}
        >
          <Save className="mr-1" />
          Guardar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onShowReceipts}
          disabled={loadingExcursion || !excursionInfo?.id || passengersCount === 0}
          title={
            loadingExcursion
              ? "Cargando excursión..."
              : !excursionInfo?.id
              ? "La excursión aún no está disponible"
              : passengersCount === 0
              ? "Debes agregar pasajeros para generar recibos"
              : undefined
          }
        >
          Generar recibos
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onEditExcursion}
          title="Editar información de la excursión"
          disabled={loadingExcursion || !excursionInfo?.id}
        >
          <Edit2 className="mr-1" /> Editar excursión
        </Button>
      </div>
    </div>
  );
}
