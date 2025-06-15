
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface PassengerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, surname: string) => void;
  defaultName?: string;
  defaultSurname?: string;
  seatNumber: number | null;
}

export function PassengerModal({
  open,
  onClose,
  onSave,
  defaultName = "",
  defaultSurname = "",
  seatNumber
}: PassengerModalProps) {
  const [name, setName] = useState(defaultName);
  const [surname, setSurname] = useState(defaultSurname);

  useEffect(() => {
    setName(defaultName);
    setSurname(defaultSurname);
  }, [defaultName, defaultSurname, open]);

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
        </div>
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button disabled={!name.trim() || !surname.trim()} onClick={() => {
            onSave(name.trim(), surname.trim());
            onClose();
          }}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
