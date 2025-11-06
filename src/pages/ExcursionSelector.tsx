
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Settings, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewExcursionDialog, NewExcursionData } from "@/components/NewExcursionDialog";
import AssociationOptions from "@/components/AssociationOptions";
import { fetchAssociation, createExcursion } from "@/utils/supabasePassengers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Excursion {
  id: number;
  name: string;
  date?: string;
  time?: string;
  place?: string;
  association_id?: string;
}

export default function ExcursionSelector() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [showAssocOptions, setShowAssocOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [association, setAssociation] = useState<any>(null);
  const [needsAssociation, setNeedsAssociation] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Cargar asociación y excursiones al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar asociación
        const assoc = await fetchAssociation();
        
        if (!assoc) {
          setNeedsAssociation(true);
          setAssociation(null);
          setExcursions([]);
        } else {
          setAssociation(assoc);
          setNeedsAssociation(false);
          
          // Cargar excursiones de la asociación
          const { data: excursionsData, error } = await supabase
            .from("excursions")
            .select("*")
            .eq("association_id", assoc.id)
            .order("created_at", { ascending: false });

          if (error) {
            toast({
              title: "Error",
              description: "No se pudieron cargar las excursiones.",
              variant: "destructive"
            });
          } else {
            setExcursions(excursionsData || []);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar los datos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para crear una asociación básica
  const createDefaultAssociation = async () => {
    try {
      const { data, error } = await supabase
        .from("associations")
        .insert({
          name: "Mi Asociación",
          phone: "",
          address: "",
          logo: ""
        })
        .select()
        .single();

      if (error) throw error;

      setAssociation(data);
      setNeedsAssociation(false);
      
      toast({
        title: "Asociación creada",
        description: "Se ha creado una asociación básica. Puedes editarla en 'Opciones'.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la asociación.",
        variant: "destructive"
      });
    }
  };

  if (showAssocOptions) {
    return <AssociationOptions onBack={() => setShowAssocOptions(false)} />;
  }

  const goToExcursion = (id: number) => {
    navigate(`/excursion/${id}`);
  };

  const handleCreateExcursion = async (data: NewExcursionData) => {
    if (!association?.id) {
      toast({
        title: "Error",
        description: "No se pudo encontrar la asociación.",
        variant: "destructive"
      });
      return;
    }

    try {
      const excursionData = {
        name: data.name,
        date: data.date ? data.date.toISOString().split('T')[0] : "",
        time: data.time || "",
        place: data.place || "",
        price: data.price || "",
        stops: data.stops || [],
        association_id: association.id,
        available_seats: data.availableSeats || 55,
      };

      const newExcursion = await createExcursion(excursionData);
      
      // Actualizar la lista local
      setExcursions(prev => [newExcursion, ...prev]);
      setShowNew(false);
      
      toast({
        title: "Excursión creada",
        description: `La excursión "${data.name}" ha sido creada correctamente.`,
        duration: 2200,
      });

      // Navegar a la nueva excursión
      goToExcursion(newExcursion.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la excursión.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <div className="text-xl">Cargando excursiones...</div>
      </div>
    );
  }

  if (needsAssociation) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background">
        <div className="rounded-xl shadow-md py-10 px-4 w-full max-w-2xl bg-white">
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center">Bienvenido</h1>
          <div className="text-center mb-8">
            <p className="text-lg mb-4">
              Para empezar a usar el sistema, necesitas crear una asociación.
            </p>
            <p className="text-gray-600 mb-6">
              Puedes configurar los detalles más tarde en las opciones.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={createDefaultAssociation}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Crear Asociación
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background">
      <div className="rounded-xl shadow-md py-10 px-4 w-full max-w-2xl bg-white">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-center flex-1">Excursiones</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-2 mb-8">
          {/* Botón grande para añadir nueva excursión */}
          <button
            className="flex flex-col items-center justify-center rounded-2xl border-4 border-dashed border-primary bg-muted hover:bg-accent transition-all py-10 px-2 cursor-pointer"
            onClick={() => setShowNew(true)}
            tabIndex={0}
            aria-label="Añadir nueva excursión"
          >
            <Plus size={48} className="text-primary mb-2" />
            <span className="text-xl font-semibold text-primary">Nueva excursión</span>
          </button>
          
          {/* Acceso directo a opciones de Asociación */}
          <button
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-green-600 bg-white text-green-700 text-2xl font-bold shadow-md py-10 px-4 hover:scale-105 transition-all"
            onClick={() => setShowAssocOptions(true)}
          >
            <span>Opciones</span>
          </button>
          
          {/* Lista de excursiones existentes */}
          {excursions.map(exc => (
            <button
              key={exc.id}
              className="flex items-center justify-center rounded-2xl border-2 border-primary bg-primary text-white text-2xl lg:text-3xl font-bold shadow-md py-10 px-4 hover:scale-105 transition-all"
              onClick={() => goToExcursion(exc.id)}
            >
              {exc.name}
            </button>
          ))}
        </div>

        {/* Dialog para nueva excursión */}
        <NewExcursionDialog
          open={showNew}
          onCancel={() => setShowNew(false)}
          onSave={handleCreateExcursion}
        />
      </div>
    </div>
  );
}
