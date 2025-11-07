/**
 * Utilidad para generar colores consistentes para las paradas
 * Cada parada siempre tendrá el mismo color basado en su nombre
 */

const COLORS = [
  "#ef4444", // red-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
];

/**
 * Genera un color consistente basado en el hash del nombre de la parada
 */
export function getStopColor(stopName: string): string {
  if (!stopName) return COLORS[0];
  
  // Hash simple del nombre
  let hash = 0;
  for (let i = 0; i < stopName.length; i++) {
    hash = stopName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return COLORS[Math.abs(hash) % COLORS.length];
}
