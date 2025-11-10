
import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAssociationConfig, setAssociationConfig, AssociationConfig } from "@/utils/associationConfig";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import AssociationDocumentPreview from "./AssociationDocumentPreview";

interface Props {
  onBack?: () => void;
}

export default function AssociationOptions({ onBack }: Props) {
  const [config, setConfig] = useState<AssociationConfig>({ name: "", logo: null, phone: null, address: null });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  
  // Load association config from database
  useEffect(() => {
    loadConfig();
  }, []);
  
  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getAssociationConfig();
      if (data) {
        setConfig(data);
        setLogoPreview(data.logo || "");
      }
    } catch (error) {
      console.error("Error loading association config:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración de la asociación.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await setAssociationConfig(config);
      toast({ 
        title: "Guardado", 
        description: "Los datos de la asociación han sido guardados.", 
        duration: 1800 
      });
      
      // Mostrar vista previa después de guardar
      setShowPreview(true);
    } catch (error) {
      console.error("Error saving association config:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleModifyData = () => {
    setShowPreview(false);
  };

  const handleContinue = () => {
    onBack?.();
  };

  // Si estamos en modo preview, mostrar el componente de preview
  if (showPreview) {
    return (
      <AssociationDocumentPreview
        config={config}
        onModify={handleModifyData}
        onContinue={handleContinue}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando configuración...</span>
        </div>
      </div>
    );
  }

  // Formulario original
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
            <Input name="phone" value={config.phone || ""} onChange={handleChange} required />
          </div>
          <div>
            <label className="font-medium">Dirección</label>
            <Input name="address" value={config.address || ""} onChange={handleChange} required />
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
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onBack}
              disabled={saving}
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
