
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface PassengerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, surname: string, phone: string) => void;
  defaultName?: string;
  defaultSurname?: string;
  defaultPhone?: string;
  seatNumber: number | null;
}

export function PassengerModal({
  open,
  onClose,
  onSave,
  defaultName = "",
  defaultSurname = "",
  defaultPhone = "",
  seatNumber
}: PassengerModalProps) {
  const [name, setName] = useState(defaultName);
  const [surname, setSurname] = useState(defaultSurname);
  const [phone, setPhone] = useState(defaultPhone);

  useEffect(() => {
    setName(defaultName);
    setSurname(defaultSurname);
    setPhone(defaultPhone);
  }, [defaultName, defaultSurname, defaultPhone, open]);

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
        </div>
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button disabled={!name.trim() || !surname.trim()} onClick={() => {
            onSave(name.trim(), surname.trim(), phone.trim());
            onClose();
          }}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
