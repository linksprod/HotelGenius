
import { Json } from '@/integrations/supabase/types';
import { InfoItem, FeatureItem } from '@/lib/types';

// Normalize an item from the database to always have label and value as strings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeInfoItem = (item: any): InfoItem => ({
  label: item?.label ?? item?.name ?? item?.key ?? item?.title ?? '',
  value: item?.value ?? item?.text ?? item?.content ?? item?.description ?? ''
});

export const parseJsonArray = <T,>(data: Json | null, defaultValue: T[]): T[] => {
  if (!data) return defaultValue;
  
  if (Array.isArray(data)) {
    // Normalize each item to make sure label/value exist
    return data.map((item) => normalizeInfoItem(item)) as T[];
  }
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => normalizeInfoItem(item)) as T[];
      }
      return defaultValue;
    } catch (e) {
      console.error('Error parsing JSON string:', e);
      return defaultValue;
    }
  }
  
  return defaultValue;
};

