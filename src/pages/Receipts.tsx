
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ReceiptPDFPreview from "@/components/ReceiptPDFPreview";

const initialData = {
  cliente: "",
  destino: "",
  fecha_excursion: "",
  monto: "",
  forma_pago: "efectivo",
};

export default function Receipts() {
  const [formData, setFormData] = useState(initialData);
  const [showPreview, setShowPreview] = useState(false);
  const [lastReceiptNum, setLastReceiptNum] = useState(() => {
    // Consigue secuencia desde localStorage o arranca en 1
    const saved = window.localStorage.getItem("receipt_seq");
    return saved ? parseInt(saved) : 1;
  });
  const [customReceiptNum, setCustomReceiptNum] = useState<string>("");

  function getNextReceiptNum() {
    const n = lastReceiptNum + 1;
    setLastReceiptNum(n);
    window.localStorage.setItem("receipt_seq", String(n));
    return n;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  }

  function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.cliente || !formData.destino || !formData.fecha_excursion || !formData.monto || !formData.forma_pago) {
      toast({
        title: "Faltan datos",
        description: "Por favor, completa todos los campos.",
        variant: "destructive"
      });
      return;
    }
    setShowPreview(true);
  }

  function handleReset() {
    setShowPreview(false);
    setFormData(initialData);
    setCustomReceiptNum("");
  }

  function handleResetCounter() {
    const newNum = 1;
    setLastReceiptNum(newNum);
    window.localStorage.setItem("receipt_seq", String(newNum));
    setCustomReceiptNum("");
    toast({
      title: "Contador reiniciado",
      description: "El contador de recibos se ha reiniciado a 1.",
    });
  }

  function handleCustomReceiptChange(value: string) {
    // Only allow numbers
    const num = value.replace(/\D/g, "");
    setCustomReceiptNum(num);
  }

  const displayReceiptNum = customReceiptNum || String(lastReceiptNum);
  const nextReceiptNum = "REC-" + displayReceiptNum.padStart(3, "0");

  return (
    <div className="min-h-screen px-2 py-8 flex flex-col items-center bg-background">
      <div className="max-w-2xl w-full bg-white shadow-md p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Generar Recibo de Excursión</h1>
        {!showPreview ? (
          <form className="space-y-4" onSubmit={handlePreview}>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <label className="block mb-2 font-semibold">Número de recibo</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-mono">REC-</span>
                  <Input 
                    type="text" 
                    value={customReceiptNum || String(lastReceiptNum)}
                    onChange={(e) => handleCustomReceiptChange(e.target.value)}
                    className="w-24 font-mono"
                    placeholder="001"
                  />
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      Reiniciar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Reiniciar el contador de recibos?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esto reiniciará el contador a 1. Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetCounter}>Reiniciar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Próximo recibo: <span className="font-mono font-semibold">{nextReceiptNum}</span>
              </p>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Nombre del Cliente</label>
              <Input type="text" name="cliente" value={formData.cliente} onChange={handleChange} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Destino excursión</label>
              <Input type="text" name="destino" value={formData.destino} onChange={handleChange} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Fecha excursión</label>
              <Input type="date" name="fecha_excursion" value={formData.fecha_excursion} onChange={handleChange} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Monto (€)</label>
              <Input type="number" name="monto" value={formData.monto} onChange={handleChange} min="0" />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Forma de pago</label>
              <select name="forma_pago" className="w-full border rounded-md px-3 py-2" value={formData.forma_pago} onChange={handleChange}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-3">
              <Button type="button" variant="secondary" onClick={handleReset}>Limpiar</Button>
              <Button type="submit">Previsualizar recibo</Button>
            </div>
          </form>
        ) : (
          <>
            <ReceiptPDFPreview
              data={{
                ...formData,
                numero: nextReceiptNum,
                fecha_emision: new Date().toLocaleDateString("es-ES"),
              }}
              getNextReceiptNum={() => {
                const numToUse = customReceiptNum ? parseInt(customReceiptNum) : lastReceiptNum;
                const next = numToUse + 1;
                setLastReceiptNum(next);
                window.localStorage.setItem("receipt_seq", String(next));
                setCustomReceiptNum("");
                return numToUse;
              }}
            />
            <div className="flex justify-end mt-6">
              <Button onClick={handleReset} variant="outline">Nuevo recibo</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
