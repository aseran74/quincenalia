import type { Database } from '@/types/supabase';

export type PropertySupabaseRow = Database['public']['Tables']['properties']['Row'];

export interface PropertyForMap extends PropertySupabaseRow {
  coordinates: [number, number];
  images: string[];
  image_url?: string;
  share1_price?: number | null;
  share2_price?: number | null;
  share3_price?: number | null;
  share4_price?: number | null;
}

export const formatPriceSimple = (price: number | null | undefined): string => {
  if (price === null || price === undefined) return 'N/A';
  return price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export function getMinSharePrice(property: Partial<PropertyForMap>): number | null {
  if (!property) return null;
  const shares = [
    property.share1_price,
    property.share2_price,
    property.share3_price,
    property.share4_price,
  ].filter((p): p is number => typeof p === 'number' && p > 0);
  if (shares.length === 0) return null;
  return Math.min(...shares);
} 