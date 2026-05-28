import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';

interface SlugCheckerProps {
  slug: string;
  onAvailabilityChange?: (available: boolean) => void;
}

type CheckState = 'idle' | 'checking' | 'available' | 'taken';

const SlugChecker: React.FC<SlugCheckerProps> = ({ slug, onAvailabilityChange }) => {
  const [status, setStatus] = useState<CheckState>('idle');

  useEffect(() => {
    if (!slug || slug.length < 2) {
      setStatus('idle');
      onAvailabilityChange?.(false);
      return;
    }

    setStatus('checking');

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabaseAdmin
          .from('hotels')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;

        const isAvailable = data === null;
        setStatus(isAvailable ? 'available' : 'taken');
        onAvailabilityChange?.(isAvailable);
      } catch {
        setStatus('idle');
        onAvailabilityChange?.(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, onAvailabilityChange]);

  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1.5 text-sm mt-1">
      {status === 'checking' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Checking availability…</span>
        </>
      )}
      {status === 'available' && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-emerald-600 font-medium">Available</span>
        </>
      )}
      {status === 'taken' && (
        <>
          <XCircle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-destructive font-medium">Already taken</span>
        </>
      )}
    </div>
  );
};

export default SlugChecker;
