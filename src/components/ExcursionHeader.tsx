
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Edit2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExcursionHeaderProps {
  loadingExcursion: boolean;
  excursionInfo: any;
  onBack: () => void;
  onSave: () => void;
  onShowReceipts: () => void;
  onEditExcursion: () => void;
  onDeleteExcursion: () => void;
  passengersCount: number;
}

export function ExcursionHeader({
  loadingExcursion,
  excursionInfo,
  onBack,
  onSave,
  onShowReceipts,
  onEditExcursion,
  onDeleteExcursion,
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              title="Eliminar excursión"
              disabled={loadingExcursion || !excursionInfo?.id}
            >
              <Trash2 className="mr-1" /> Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar excursión?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará la excursión "{excursionInfo?.name}" 
                y todos los pasajeros asociados permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteExcursion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
