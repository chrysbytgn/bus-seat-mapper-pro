import { supabase } from "@/integrations/supabase/client";
import type { Passenger } from "@/components/BusSeatMap";
import type { ExcursionData } from "@/pages/Index";

// Since ExcursionData now uses id: number
export async function fetchAssociation() {
  const { data, error } = await supabase
    .from("associations")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("Error fetching association:", error);
    throw error;
  }
  return data;
}

export async function fetchExcursionById(excursionId: number) {
  console.log("Fetching excursion with ID:", excursionId);
  const { data, error } = await supabase
    .from("excursions")
    .select("*")
    .eq("id", excursionId)
    .maybeSingle();
  if (error) {
    console.error("Error fetching excursion:", error);
    throw error;
  }
  console.log("Excursion data fetched:", data);
  return data;
}

export async function fetchPassengers(excursionId: number) {
  console.log("Fetching passengers for excursion:", excursionId);
  const { data, error } = await supabase
    .from("passengers")
    .select("*")
    .eq("excursion_id", excursionId)
    .order("seat", { ascending: true });
  if (error) {
    console.error("Error fetching passengers:", error);
    throw error;
  }
  console.log("Passengers data fetched:", data);
  return data || [];
}

// Create new excursion - generate a unique ID using timestamp
export async function createExcursion(excursion: Omit<ExcursionData, 'id'> & { association_id: string }) {
  console.log("Creating new excursion:", excursion);
  
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
  };
  
  const { data, error } = await supabase
    .from("excursions")
    .insert(record)
    .select()
    .single();
  if (error) {
    console.error("Error creating excursion:", error);
    throw error;
  }
  console.log("Excursion created:", data);
  return data;
}

// Fix types for upsert - ahora solo para actualizar excursiones existentes
export async function upsertExcursion(excursion: ExcursionData & { association_id: string }) {
  console.log("Upserting excursion:", excursion);
  // Ensure stops is json
  const record = {
    ...excursion,
    id: Number(excursion.id),
    stops: excursion.stops ?? [],
  };
  const { data, error } = await supabase
    .from("excursions")
    .upsert([record])
    .select();
  if (error) {
    console.error("Error upserting excursion:", error);
    throw error;
  }
  console.log("Excursion upserted:", data);
  return data?.[0];
}

export async function deleteExcursion(excursionId: number) {
  console.log("Deleting excursion with ID:", excursionId);
  const { error } = await supabase
    .from("excursions")
    .delete()
    .eq("id", excursionId);
  if (error) {
    console.error("Error deleting excursion:", error);
    throw error;
  }
  console.log("Excursion deleted successfully");
}

export async function upsertPassenger(excursion_id: number, passenger: Passenger) {
  console.log("Upserting passenger:", passenger, "for excursion:", excursion_id);
  // seat is unique for excursion_id - specify onConflict to handle updates properly
  const { data, error } = await supabase
    .from("passengers")
    .upsert([{
      excursion_id,
      seat: passenger.seat,
      name: passenger.name,
      surname: passenger.surname,
      phone: passenger.phone || null
    }], {
      onConflict: 'excursion_id,seat'
    })
    .select();
  if (error) {
    console.error("Error upserting passenger:", error);
    throw error;
  }
  console.log("Passenger upserted:", data);
  return data?.[0];
}

export async function clearPassengers(excursion_id: number) {
  console.log("Clearing passengers for excursion:", excursion_id);
  const { error } = await supabase
    .from("passengers")
    .delete()
    .eq("excursion_id", excursion_id);
  if (error) {
    console.error("Error clearing passengers:", error);
    throw error;
  }
  console.log("Passengers cleared successfully");
}
