import { supabase } from "@/integrations/supabase/client";

export type AssociationConfig = {
  name: string;
  logo: string | null; // DataURL o URL
  phone: string | null;
  address: string | null;
};

/**
 * Fetches the association config from the database for the current user
 */
export async function getAssociationConfig(): Promise<AssociationConfig | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("association_id")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profileError || !profile?.association_id) return null;
    
    const { data: association, error } = await supabase
      .from("associations")
      .select("*")
      .eq("id", profile.association_id)
      .maybeSingle();
    
    if (error || !association) return null;
    
    return {
      name: association.name,
      logo: association.logo,
      phone: association.phone,
      address: association.address,
    };
  } catch (e) {
    console.error("Error fetching association config:", e);
    return null;
  }
}

/**
 * Updates the association config in the database
 */
export async function setAssociationConfig(config: AssociationConfig): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("association_id")
    .eq("id", user.id)
    .maybeSingle();
  
  if (!profile?.association_id) {
    // Create new association
    const { data: newAssociation, error: createError } = await supabase
      .from("associations")
      .insert({
        name: config.name,
        logo: config.logo,
        phone: config.phone,
        address: config.address,
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    // The trigger will automatically link this association to the user
  } else {
    // Update existing association
    const { error } = await supabase
      .from("associations")
      .update({
        name: config.name,
        logo: config.logo,
        phone: config.phone,
        address: config.address,
      })
      .eq("id", profile.association_id);
    
    if (error) throw error;
  }
}
