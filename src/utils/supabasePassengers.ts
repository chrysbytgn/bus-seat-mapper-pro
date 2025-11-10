import { supabase } from "@/integrations/supabase/client";
import type { Passenger } from "@/components/BusSeatMap";
import type { ExcursionData } from "@/pages/Index";

// Since ExcursionData now uses id: number
export async function fetchAssociation() {
  // First get the user's profile to find their association_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("association_id")
    .eq("id", user.id)
    .maybeSingle();
  
  if (profileError) throw profileError;
  if (!profile?.association_id) return null;
  
  // Then fetch their specific association
  const { data, error } = await supabase
    .from("associations")
    .select("*")
    .eq("id", profile.association_id)
    .maybeSingle();
    
  if (error) throw error;
  return data;
}

export async function fetchExcursionById(excursionId: number) {
  const { data, error } = await supabase
    .from("excursions")
    .select("*")
    .eq("id", excursionId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

export async function fetchPassengers(excursionId: number) {
  const { data, error } = await supabase
    .from("passengers")
    .select("*")
    .eq("excursion_id", excursionId)
    .order("seat", { ascending: true });
  if (error) {
    throw error;
  }
  return data || [];
}

// Create new excursion - generate a unique ID using timestamp
export async function createExcursion(excursion: Omit<ExcursionData, 'id'> & { association_id: string }) {
  // Generate a unique ID using timestamp
  const uniqueId = Date.now();
  
  const record = {
    id: uniqueId,
    name: excursion.name,
    association_id: excursion.association_id,
    date: excursion.date || null,
    time: excursion.time || null,
    place: excursion.place || null,
    price: excursion.price || null,
    stops: excursion.stops || null,
    available_seats: excursion.available_seats || 55,
  };
  
  const { data, error } = await supabase
    .from("excursions")
    .insert(record)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}

// Fix types for upsert - ahora solo para actualizar excursiones existentes
export async function upsertExcursion(excursion: ExcursionData & { association_id: string }) {
  // Ensure stops is json
  const record = {
    ...excursion,
    id: Number(excursion.id),
    stops: excursion.stops ?? [],
    available_seats: excursion.available_seats ?? 55,
  };
  const { data, error } = await supabase
    .from("excursions")
    .upsert([record])
    .select();
  if (error) {
    throw error;
  }
  return data?.[0];
}

export async function deleteExcursion(excursionId: number) {
  const { error } = await supabase
    .from("excursions")
    .delete()
    .eq("id", excursionId);
  if (error) {
    throw error;
  }
}

export async function upsertPassenger(excursion_id: number, passenger: Passenger) {
  // seat is unique for excursion_id - specify onConflict to handle updates properly
  const { data, error } = await supabase
    .from("passengers")
    .upsert([{
      excursion_id,
      seat: passenger.seat,
      name: passenger.name,
      surname: passenger.surname,
      phone: passenger.phone || null,
      stop_name: passenger.stop_name || null
    }], {
      onConflict: 'excursion_id,seat'
    })
    .select();
  if (error) {
    throw error;
  }
  return data?.[0];
}

export async function clearPassengers(excursion_id: number) {
  const { error } = await supabase
    .from("passengers")
    .delete()
    .eq("excursion_id", excursion_id);
  if (error) {
    throw error;
  }
}
