
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Plus, AlertTriangle, Bed, Utensils, ConciergeBell, X, ShieldAlert } from 'lucide-react';
import { useGuestPreferences } from '../hooks/useGuestPreferences';
import AddPreferenceDialog from './AddPreferenceDialog';
import AddMedicalAlertDialog from './AddMedicalAlertDialog';

const categoryConfig: Record<string, { label: string; icon: React.ElementType }> = {
  room: { label: 'Room', icon: Bed },
  dining: { label: 'Dining', icon: Utensils },
  service: { label: 'Service', icon: ConciergeBell },
};

const severityColors: Record<string, string> = {
  Critical: 'bg-destructive/15 text-destructive border-destructive/30',
  High: 'bg-destructive/10 text-destructive border-destructive/20',
  Medium: 'bg-orange-100 text-orange-800 border-orange-200',
  Low: 'bg-blue-50 text-blue-800 border-blue-200',
};

const PreferencesSection: React.FC = () => {
  const { preferences, alerts, isLoading, addPreference, deletePreference, addAlert, deleteAlert } = useGuestPreferences();
  const [prefDialogOpen, setPrefDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const groupedPrefs = preferences.reduce<Record<string, typeof preferences>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  if (isLoading) return null;

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 shrink-0" />
              Preferences &amp; Medical Info
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setAlertDialogOpen(true)}>
                <ShieldAlert className="h-4 w-4 mr-1" />
                Medical Alert
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPrefDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Preference
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Medical Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <AlertTriangle className="h-3.5 w-3.5" />
                Medical Alerts
              </div>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start justify-between rounded-lg border p-3 ${severityColors[alert.severity] || severityColors.Low}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{alert.alert_type}</Badge>
                        <Badge variant="outline" className="text-xs font-bold">{alert.severity}</Badge>
                      </div>
                      <p className="text-sm">{alert.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => deleteAlert.mutate(alert.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.length > 0 && Object.keys(groupedPrefs).length > 0 && <Separator />}

          {/* Preferences by category */}
          {(['room', 'dining', 'service'] as const).map((cat) => {
            const items = groupedPrefs[cat];
            if (!items?.length) return null;
            const config = categoryConfig[cat];
            const Icon = config.icon;
            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((p) => (
                    <Badge key={p.id} variant="outline" className="gap-1 pr-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      {p.value}
                      <button
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                        onClick={() => deletePreference.mutate(p.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}

          {alerts.length === 0 && preferences.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              No preferences or medical alerts yet. Add your first one above.
            </p>
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
