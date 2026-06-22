
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles, Plus, AlertTriangle, BedDouble,
  Utensils, ConciergeBell, X, ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useGuestPreferences } from '../hooks/useGuestPreferences';
import AddPreferenceDialog from './AddPreferenceDialog';
import AddMedicalAlertDialog from './AddMedicalAlertDialog';

/* ─── Category config ─────────────────────────────── */
const categoryConfig: Record<string, { labelKey: string; fallback: string; icon: React.ElementType; pill: string }> = {
  room:    { labelKey: 'profilePage.preferences.categories.room',    fallback: 'Chambre',      icon: BedDouble,     pill: 'bg-blue-500/15 text-blue-300 border-blue-500/30 dark:text-blue-300' },
  dining:  { labelKey: 'profilePage.preferences.categories.dining',  fallback: 'Restauration', icon: Utensils,      pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30 dark:text-amber-300' },
  service: { labelKey: 'profilePage.preferences.categories.service', fallback: 'Service',      icon: ConciergeBell, pill: 'bg-violet-500/15 text-violet-300 border-violet-500/30 dark:text-violet-300' },
};

/* ─── Severity config ─────────────────────────────── */
const severityConfig: Record<string, { label: string; bar: string; bg: string; text: string; icon: string }> = {
  Critical: { label: 'Critique',   bar: 'bg-red-500',    bg: 'bg-red-500/10 border-red-500/30',    text: 'text-red-400',    icon: '🔴' },
  High:     { label: 'Élevé',      bar: 'bg-orange-500', bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', icon: '🟠' },
  Medium:   { label: 'Moyen',      bar: 'bg-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', icon: '🟡' },
  Low:      { label: 'Faible',     bar: 'bg-blue-500',   bg: 'bg-blue-500/10 border-blue-500/30',   text: 'text-blue-400',   icon: '🔵' },
};

const getSeverity = (s: string) =>
  severityConfig[s] ?? severityConfig.Low;

/* ─── Helper ──────────────────────────────────────── */
const getAlertTypeKey = (type: string) => {
  if (type.toLowerCase() === 'medical alert') return 'medicalAlert';
  if (type.toLowerCase() === 'allergy') return 'allergy';
  return type;
};

/* ─── Component ───────────────────────────────────── */
const PreferencesSection: React.FC = () => {
  const { t } = useTranslation();
  const { preferences, alerts, isLoading, addPreference, deletePreference, addAlert, deleteAlert } = useGuestPreferences();
  const [prefDialogOpen, setPrefDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const groupedPrefs = preferences.reduce<Record<string, typeof preferences>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  const translatePreferenceValue = (val: string) => {
    const key = val.toLowerCase().replace(/ /g, '_');
    return t(`profilePage.preferences.suggestions.${key}`, val);
  };

  if (isLoading) return null;

  const hasAlerts = alerts.length > 0;
  const hasPrefs  = preferences.length > 0;

  return (
    <>
      <Card className="mb-6 border border-white/10 bg-white/5 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl overflow-hidden">
        {/* ── Header ── */}
        <CardHeader className="pb-4 border-b border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              {t('profilePage.preferences.title')}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                onClick={() => setAlertDialogOpen(true)}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                {t('profilePage.preferences.medicalAlert')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => setPrefDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                {t('profilePage.preferences.preference')}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-6">

          {/* ── Alertes médicales ── */}
          {hasAlerts && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-red-400/80">
                  {t('profilePage.preferences.medicalAlerts')}
                </span>
              </div>

              <div className="space-y-2">
                {alerts.map((alert) => {
                  const sev = getSeverity(alert.severity);
                  return (
                    <div
                      key={alert.id}
                      className={`relative flex items-start gap-3 rounded-xl border p-3.5 ${sev.bg}`}
                    >
                      {/* Left severity bar */}
                      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${sev.bar}`} />

                      <div className="pl-3 flex-1 min-w-0 space-y-1">
                        {/* Type + Severity badges */}
                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`text-xs font-bold uppercase tracking-wide ${sev.text}`}>
                            {t('profilePage.preferences.dialogs.types.' + getAlertTypeKey(alert.alert_type), alert.alert_type)}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sev.bg} ${sev.text}`}>
                            {sev.icon} {sev.label}
                          </span>
                        </div>
                        {/* Description */}
                        {alert.description && (
                          <p className="text-sm text-foreground/80 leading-relaxed">{alert.description}</p>
                        )}
                      </div>

                      <button
                        className="shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors mt-0.5"
                        onClick={() => deleteAlert.mutate(alert.id)}
                        title="Supprimer"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hasAlerts && hasPrefs && <Separator className="opacity-20" />}

          {/* ── Préférences par catégorie ── */}
          {(['room', 'dining', 'service'] as const).map((cat) => {
            const items = groupedPrefs[cat];
            if (!items?.length) return null;
            const config = categoryConfig[cat];
            const Icon = config.icon;
            return (
              <div key={cat} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t(config.labelKey, config.fallback)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((p) => (
                    <span
                      key={p.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${config.pill}`}
                    >
                      {translatePreferenceValue(p.value)}
                      <button
                        className="rounded-full hover:bg-white/10 transition-colors p-0.5"
                        onClick={() => deletePreference.mutate(p.id)}
                        title="Supprimer"
                      >
                        <X className="h-3 w-3 opacity-70 hover:opacity-100" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* ── Empty state ── */}
          {!hasAlerts && !hasPrefs && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="p-3 rounded-full bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary/60" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('profilePage.preferences.noPrefsOrAlerts', 'Aucune préférence ou alerte enregistrée')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPreferenceDialog
        open={prefDialogOpen}
        onOpenChange={setPrefDialogOpen}
        onAdd={(category, value) => addPreference.mutate({ category, value })}
      />
      <AddMedicalAlertDialog
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
        onAdd={(alert) => addAlert.mutate(alert)}
      />
    </>
  );
};

export default PreferencesSection;
