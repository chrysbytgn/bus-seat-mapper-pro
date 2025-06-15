
import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAssociationConfig, setAssociationConfig, AssociationConfig } from "@/utils/associationConfig";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AssociationOptions() {
  const [config, setConfig] = useState<AssociationConfig>(getAssociationConfig());
  const [logoPreview, setLogoPreview] = useState<string>(config.logo || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(c => ({ ...c, [e.target.name]: e.target.value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setLogoPreview(ev.target?.result as string);
        setConfig(c => ({ ...c, logo: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAssociationConfig(config);
    toast({ title: "Guardado", description: "Los datos de la asociación han sido guardados.", duration: 1800 });
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-background">
      <div className="bg-white border rounded-xl shadow px-7 py-8 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-5 text-center mt-2">Opciones de Asociación</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSave}>
          <div>
            <label className="font-medium">Nombre de la asociación</label>
            <Input name="name" value={config.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="font-medium">Teléfono</label>
            <Input name="phone" value={config.phone} onChange={handleChange} required />
          </div>
          <div>
            <label className="font-medium">Dirección</label>
            <Input name="address" value={config.address} onChange={handleChange} required />
          </div>
          <div>
            <label className="font-medium">Logo</label>
            <input ref={fileRef} type="file" accept="image/*" className="block mt-1" onChange={handleLogoChange} />
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="Logo Preview" className="w-16 h-16 object-cover border rounded-full" />
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="submit">Guardar</Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-1" />
              Volver atrás
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
