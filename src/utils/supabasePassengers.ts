
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
  if (error) throw error;
  return data;
}

export async function fetchExcursionById(excursionId: number) {
  const { data, error } = await supabase
    .from("excursions")
    .select("*")
    .eq("id", excursionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchPassengers(excursionId: number) {
  const { data, error } = await supabase
    .from("passengers")
    .select("*")
    .eq("excursion_id", excursionId)
    .order("seat", { ascending: true });
  if (error) throw error;
  return data || [];
}

// Fix types for upsert
export async function upsertExcursion(excursion: ExcursionData & { association_id: string }) {
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
  if (error) throw error;
  return data?.[0];
}

export async function upsertPassenger(excursion_id: number, passenger: Passenger) {
  // seat is unique for excursion_id
  const { data, error } = await supabase
    .from("passengers")
    .upsert([{
      excursion_id,
      seat: passenger.seat,
      name: passenger.name,
      surname: passenger.surname
    }])
    .select();
  if (error) throw error;
  return data?.[0];
}

export async function clearPassengers(excursion_id: number) {
  const { error } = await supabase
    .from("passengers")
    .delete()
    .eq("excursion_id", excursion_id);
  if (error) throw error;
}
