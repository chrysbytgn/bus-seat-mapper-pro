
export type AssociationConfig = {
  name: string;
  logo: string; // DataURL o URL
  phone: string;
  address: string;
};

const LOCAL_KEY = "association_config";

export function getAssociationConfig(): AssociationConfig {
  if (typeof window === "undefined") return { name: "", logo: "", phone: "", address: "" };
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return { name: "", logo: "", phone: "", address: "" };
}

export function setAssociationConfig(config: AssociationConfig) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(config));
}
