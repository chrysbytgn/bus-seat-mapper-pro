
import * as React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock as ClockIcon, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { ExcursionData } from "@/pages/Index";

// props: open, excursion, onCancel, onSave
interface Props {
  open: boolean;
  excursion?: ExcursionData | null;
  onCancel: () => void;
  onSave: (data: ExcursionData) => void;
}
export function EditExcursionDialog({ open, excursion, onCancel, onSave }: Props) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [place, setPlace] = useState("");
  const [time, setTime] = useState(""); // Simple string: "HH:MM"
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const [stops, setStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState(""); // Para nuevo input de parada
  const [price, setPrice] = useState("");
  const [availableSeats, setAvailableSeats] = useState(55);
  const [seatsInput, setSeatsInput] = useState("55");

  useEffect(() => {
    if (excursion) {
      setName(excursion.name || "");
      setDate(excursion.date ? new Date(excursion.date) : null);
      setPlace(excursion.place || "");
      setTime(excursion.time || "");
      setStops(excursion.stops ? [...excursion.stops] : []);
      setNewStop("");
      setPrice(excursion.price || "");
      setAvailableSeats(excursion.available_seats || 55);
      setSeatsInput(String(excursion.available_seats || 55));
    }
  }, [excursion, open]);

  // Time picker
  const timeOptions = Array.from({ length: 36 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const canSave = name.trim() && date && time && place.trim() && price.trim() && availableSeats >= 1 && availableSeats <= 55;

  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar excursión</DialogTitle>
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
          {/* Hora - Input manual */}
          <div className="relative flex items-center">
            <ClockIcon size={20} className="absolute left-3 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Hora de salida (ej: 09:30)"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="pl-10"
              maxLength={5}
            />
          </div>
          <div className="relative flex items-center">
            <MapPin size={20} className="absolute left-3 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Lugar de salida"
              value={place}
              onChange={e => setPlace(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <label className="font-medium">Plazas disponibles</label>
            <Input
              placeholder="Número de asientos disponibles (máx. 55)"
              type="text"
              value={seatsInput}
              onChange={e => {
                const v = e.target.value;
                // Permitir vacío o solo dígitos; no forzar inmediatamente el número final
                if (/^\d*$/.test(v)) {
                  setSeatsInput(v);
                  if (v !== "" && Number(v) >= 1 && Number(v) <= 55) {
                    setAvailableSeats(Number(v));
                  }
                }
              }}
              onBlur={() => {
                const num = Number(seatsInput);
                if (!seatsInput || isNaN(num) || num < 1 || num > 55) {
                  setSeatsInput("55");
                  setAvailableSeats(55);
                } else {
                  setSeatsInput(String(num));
                  setAvailableSeats(num);
                }
              }}
            />
          </div>
          <div>
            <label className="font-medium">Precio por asiento (€)</label>
            <Input
              placeholder="Precio, ej: 24"
              type="number"
              value={price}
              min="0"
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">Paradas adicionales para recoger (opcional)</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newStop}
                onChange={e => setNewStop(e.target.value)}
                placeholder="Ej: Barrio El Norte"
                className="flex-1"
              />
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  if (newStop.trim()) {
                    setStops(list => [...list, newStop.trim()]);
                    setNewStop("");
                  }
                }}
              >Añadir</Button>
            </div>
            <ul className="mt-2 ml-5 list-disc text-sm text-gray-700">
              {stops.map((stop, idx) => (
                <li key={idx} className="flex items-center">
                  <span>{stop}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    title="Eliminar parada"
                    className="text-xs text-red-400 ml-2 px-1"
                    onClick={() =>
                      setStops(list => list.filter((_, i) => i !== idx))
                    }
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button
            disabled={!canSave}
            onClick={() => {
              if (canSave) {
                onSave({
                  ...excursion!,
                  name: name.trim(),
                  date: date ? date.toISOString() : undefined,
                  time,
                  place: place.trim(),
                  price: price.trim(),
                  stops,
                  available_seats: availableSeats,
                });
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
