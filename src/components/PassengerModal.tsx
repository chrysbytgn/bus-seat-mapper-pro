
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface PassengerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, surname: string, phone: string, stopName?: string) => void;
  defaultName?: string;
  defaultSurname?: string;
  defaultPhone?: string;
  defaultStopName?: string;
  availableStops?: string[];
  seatNumber: number | null;
}

export function PassengerModal({
  open,
  onClose,
  onSave,
  defaultName = "",
  defaultSurname = "",
  defaultPhone = "",
  defaultStopName = "",
  availableStops = [],
  seatNumber
}: PassengerModalProps) {
  const [name, setName] = useState(defaultName);
  const [surname, setSurname] = useState(defaultSurname);
  const [phone, setPhone] = useState(defaultPhone);
  const [stopName, setStopName] = useState(defaultStopName);

  useEffect(() => {
    setName(defaultName);
    setSurname(defaultSurname);
    setPhone(defaultPhone);
    setStopName(defaultStopName);
  }, [defaultName, defaultSurname, defaultPhone, defaultStopName, open]);

  return (
    <Dialog open={open} onOpenChange={v => !v ? onClose() : undefined}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pasajero asiento {seatNumber}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input
            placeholder="Nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <Input
            placeholder="Apellido"
            value={surname}
            onChange={e => setSurname(e.target.value)}
          />
          <Input
            placeholder="Teléfono (opcional)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            type="tel"
          />
          {availableStops.length > 0 && (
            <Select value={stopName} onValueChange={setStopName}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar parada (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {availableStops.map((stop) => (
                  <SelectItem key={stop} value={stop}>
                    {stop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button disabled={!name.trim() || !surname.trim()} onClick={() => {
            onSave(name.trim(), surname.trim(), phone.trim(), stopName || undefined);
            onClose();
          }}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
