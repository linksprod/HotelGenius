import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Megaphone, Coins, Star, Zap, MessageSquare, Award, Gift, Info, Shield, Heart, Bell, Calendar, Users, Building2, Globe, Sparkles } from 'lucide-react';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { motion } from 'framer-motion';

interface BulletinItem {
  label: string;
  value: string;
  note?: string;
}

interface Bulletin {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: BulletinItem[];
  order_index: number;
  is_published: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Coins, Star, Zap, MessageSquare, Award, Gift, Info, Shield, Heart, Bell, Calendar, Users, Building2, Globe, Sparkles, Megaphone,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  amber:   { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', accent: 'bg-amber-500' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', accent: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', accent: 'bg-emerald-500' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', accent: 'bg-purple-500' },
  red:     { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', accent: 'bg-red-500' },
  orange:  { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', accent: 'bg-orange-500' },
  cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800', accent: 'bg-cyan-500' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', accent: 'bg-rose-500' },
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
});

const PlatformBulletins: React.FC = () => {
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_bulletins')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (!error && data) setBulletins(data as Bulletin[]);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bulletins.length === 0) {
    return (
      <div className="flex-1 p-6">
        <AdminPageHeader
          title="Informations Plateforme"
          description="Informations générales publiées par Hotel Genius pour tous les hôtels du réseau."
          icon={<Megaphone className="h-5 w-5 text-primary" />}
        />
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Megaphone className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-foreground font-medium">Aucune information disponible pour le moment</p>
          <p className="text-sm mt-1">Les informations publiées par Hotel Genius apparaîtront ici.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <AdminPageHeader
        title="Informations Plateforme"
        description="Informations générales publiées par Hotel Genius pour tous les hôtels du réseau."
        icon={<Megaphone className="h-5 w-5 text-primary" />}
      />

      {/* Platform origin banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-sm">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Megaphone className="h-4 w-4 text-primary" />
        </div>
        <div>
          <span className="font-semibold text-foreground">Publié par Hotel Genius Platform</span>
          <span className="text-muted-foreground ml-2">·</span>
          <span className="text-muted-foreground ml-2">Ces informations sont en lecture seule et s'appliquent à tous les hôtels du réseau.</span>
        </div>
      </div>

      {/* Bulletins */}
      <div className="space-y-4">
        {bulletins.map((b, idx) => {
          const colors = COLOR_MAP[b.color] || COLOR_MAP.blue;
          const IconComponent = ICON_MAP[b.icon] || Info;

          return (
            <motion.div key={b.id} {...fadeUp(idx * 0.08)}>
              <Card className={`border ${colors.border} ${colors.bg} overflow-hidden`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${colors.accent} flex items-center justify-center shrink-0`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className={`text-base ${colors.text}`}>{b.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {b.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 rounded-lg bg-background/60 border border-border/50">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          {item.note && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{item.note}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className={`shrink-0 font-bold text-sm px-3 py-1 ${colors.text} bg-background border ${colors.border}`}>
                          {item.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformBulletins;
