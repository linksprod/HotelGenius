
import { Json } from '@/integrations/supabase/types';
import { InfoItem, FeatureItem } from '@/lib/types';

// Normalize a directory info item (label/value pair) from the database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeInfoItem = (item: any): InfoItem => ({
  label: item?.label ?? item?.name ?? item?.key ?? '',
  value: item?.value ?? item?.text ?? item?.content ?? ''
});

// Normalize a feature item (icon/title/description) from the database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeFeatureItem = (item: any): FeatureItem => ({
  icon: (item?.icon && item.icon !== 'undefined' && item.icon !== 'null') ? item.icon : 'History',
  title: item?.title ?? item?.name ?? '',
  description: item?.description ?? item?.text ?? item?.content ?? ''
});

export const parseJsonArray = <T,>(data: Json | null, defaultValue: T[], type: 'info' | 'feature' = 'info'): T[] => {
  if (!data) return defaultValue;

  const normalize = type === 'feature'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (item: any) => normalizeFeatureItem(item)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : (item: any) => normalizeInfoItem(item);

  if (Array.isArray(data)) {
    return data.map(normalize) as T[];
  }

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map(normalize) as T[];
      }
      return defaultValue;
    } catch (e) {
      console.error('Error parsing JSON string:', e);
      return defaultValue;
    }
  }

  return defaultValue;
};
