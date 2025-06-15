
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
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
  }

  const nextReceiptNum = "REC-" + String(lastReceiptNum).padStart(3, "0");

  return (
    <div className="min-h-screen px-2 py-8 flex flex-col items-center bg-background">
      <div className="max-w-2xl w-full bg-white shadow-md p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Generar Recibo de Excursión</h1>
        {!showPreview ? (
          <form className="space-y-4" onSubmit={handlePreview}>
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
              getNextReceiptNum={getNextReceiptNum}
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
