
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock as ClockIcon, MapPin } from "lucide-react";
import { format } from "date-fns";

export interface NewExcursionData {
  name: string;
  date: Date | null;
  time: string;
  place: string;
}

interface NewExcursionDialogProps {
  open: boolean;
  onCancel: () => void;
  onSave: (data: NewExcursionData) => void;
}

export function NewExcursionDialog({ open, onCancel, onSave }: NewExcursionDialogProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [place, setPlace] = useState("");
  const [time, setTime] = useState(""); // Simple string: "HH:MM"
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);

  // Reset form on open
  React.useEffect(() => {
    if (open) {
      setName("");
      setDate(null);
      setPlace("");
      setTime("");
      setTimePopoverOpen(false);
    }
  }, [open]);

  // Time picker: simple selector 06:00-23:00 de cada media hora
  const timeOptions = Array.from({ length: 36 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const canSave = name.trim() && date && time && place.trim();

  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir nueva excursión</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <Input
            placeholder="Nombre de la excursión"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          {/* Fecha */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start"
                tabIndex={0}
                type="button"
              >
                <CalendarIcon className="mr-2" />
                {date ? format(date, "dd/MM/yyyy") : "Seleccione la fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                selected={date}
                onSelect={setDate}
                mode="single"
                initialFocus
                className="p-3 pointer-events-auto"
                disabled={d => d < new Date(new Date().setHours(0,0,0,0))}
              />
            </PopoverContent>
          </Popover>
          {/* Hora */}
          <Popover open={timePopoverOpen} onOpenChange={setTimePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start"
                tabIndex={0}
                type="button"
              >
                <ClockIcon className="mr-2" />
                {time ? time : "Hora de salida"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-0">
              <div className="max-h-56 overflow-y-auto">
                {timeOptions.map(opt => (
                  <button
                    key={opt}
                    className={`w-full text-left px-3 py-2 hover:bg-primary/10 ${time === opt ? 'font-bold text-primary' : ''}`}
                    onClick={() => { setTime(opt); setTimePopoverOpen(false); }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Input
            placeholder="Lugar de salida"
            value={place}
            onChange={e => setPlace(e.target.value)}
            icon={MapPin}
          />
        </div>
        <DialogFooter className="pt-4">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button
            disabled={!canSave}
            onClick={() => {
              if (canSave) {
                onSave({ name: name.trim(), date, time, place: place.trim() });
              }
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
