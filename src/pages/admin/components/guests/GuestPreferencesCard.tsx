import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  Plus,
  X,
  ShieldAlert,
  BedDouble,
  Utensils,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAdminGuestPreferences } from '@/hooks/admin/useAdminGuestPreferences';

/* ── Category config ─────────────────────────────────── */
const PREFERENCE_CATEGORIES = [
  { value: 'room', label: 'Room', icon: BedDouble, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  { value: 'dining', label: 'Dining', icon: Utensils, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  { value: 'service', label: 'Service', icon: Sparkles, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800' },
  { value: 'other', label: 'Other', icon: Brain, color: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800' },
];

const ALERT_SEVERITIES = [
  { value: 'low', label: 'Low', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800' },
  { value: 'medium', label: 'Medium', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800' },
  { value: 'high', label: 'High', color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800' },
];

const ALERT_TYPES = [
  'Food allergy',
  'Drug allergy',
  'Medical condition',
  'Reduced mobility',
  'Dietary requirement',
  'Other',
];

function getCategoryConfig(category: string) {
  return PREFERENCE_CATEGORIES.find(c => c.value === category) ?? PREFERENCE_CATEGORIES[3];
}

function getSeverityConfig(severity: string) {
  return ALERT_SEVERITIES.find(s => s.value === severity) ?? ALERT_SEVERITIES[0];
}

/* ── Add Preference Dialog ─────────────────────────── */
interface AddPreferenceDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (category: string, value: string) => void;
  isPending: boolean;
}
const AddPreferenceDialog: React.FC<AddPreferenceDialogProps> = ({ open, onClose, onAdd, isPending }) => {
  const [category, setCategory] = useState('room');
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) return;
    onAdd(category, value.trim());
    setValue('');
    setCategory('room');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Add Preference
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREFERENCE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preference</Label>
            <Input
              placeholder="E.g., Non-smoking, Quiet room, Gluten-free..."
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!value.trim() || isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ── Add Alert Dialog ──────────────────────────────── */
interface AddAlertDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (alert: { alert_type: string; severity: string; description: string }) => void;
  isPending: boolean;
}
const AddAlertDialog: React.FC<AddAlertDialogProps> = ({ open, onClose, onAdd, isPending }) => {
  const [alertType, setAlertType] = useState(ALERT_TYPES[0]);
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) return;
    onAdd({ alert_type: alertType, severity, description: description.trim() });
    setDescription('');
    setSeverity('medium');
    setAlertType(ALERT_TYPES[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Add Alert
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Alert Type</Label>
            <Select value={alertType} onValueChange={setAlertType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALERT_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALERT_SEVERITIES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the alert in detail..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!description.trim() || isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ── Main Card ─────────────────────────────────────── */
interface GuestPreferencesCardProps {
  guestId: string;
}

const GuestPreferencesCard: React.FC<GuestPreferencesCardProps> = ({ guestId }) => {
  const [prefDialogOpen, setPrefDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const {
    preferences,
    isLoadingPreferences,
    addPreference,
    deletePreference,
    alerts,
    isLoadingAlerts,
    addAlert,
    deleteAlert,
  } = useAdminGuestPreferences(guestId);

  const handleAddPreference = (category: string, value: string) => {
    addPreference.mutate({ category, value }, { onSuccess: () => setPrefDialogOpen(false) });
  };

  const handleAddAlert = (alert: { alert_type: string; severity: string; description: string }) => {
    addAlert.mutate(alert, { onSuccess: () => setAlertDialogOpen(false) });
  };

  /* Group preferences by category */
  const grouped = PREFERENCE_CATEGORIES.map(cat => ({
    ...cat,
    items: preferences.filter(p => p.category === cat.value),
  })).filter(g => g.items.length > 0);

  return (
    <>
      <Card className="overflow-hidden border border-border dark:border-none bg-card/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm dark:shadow-2xl rounded-[2rem]">
        <CardContent className="p-8 space-y-8">

          {/* ── Preferences ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-white/5 rounded-xl">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Guest Preferences</h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setPrefDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>

            {isLoadingPreferences ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : preferences.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-3">
                No preferences recorded
              </p>
            ) : (
              <div className="space-y-4">
                {grouped.map(group => {
                  const Icon = group.icon;
                  return (
                    <div key={group.value}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {group.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map(pref => (
                          <Badge
                            key={pref.id}
                            variant="outline"
                            className={`gap-1.5 pr-1.5 py-1 text-xs font-medium ${group.color}`}
                          >
                            {pref.value}
                            <button
                              onClick={() => deletePreference.mutate(pref.id)}
                              className="ml-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                              title="Delete"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Separator ── */}
          <div className="border-t border-border/40" />

          {/* ── Alerts ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Alerts</h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setAlertDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>

            {isLoadingAlerts ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-3">
                No alerts recorded
              </p>
            ) : (
              <div className="space-y-2">
                {alerts.map(alert => {
                  const sevConfig = getSeverityConfig(alert.severity);
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${sevConfig.color}`}
                    >
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-xs uppercase tracking-wide">
                            {alert.alert_type}
                          </span>
                          <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${sevConfig.color}`}>
                            {getSeverityConfig(alert.severity).label}
                          </Badge>
                        </div>
                        <p className="text-xs opacity-80 leading-relaxed">{alert.description}</p>
                      </div>
                      <button
                        onClick={() => deleteAlert.mutate(alert.id)}
                        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
                        title="Delete alert"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPreferenceDialog
        open={prefDialogOpen}
        onClose={() => setPrefDialogOpen(false)}
        onAdd={handleAddPreference}
        isPending={addPreference.isPending}
      />
      <AddAlertDialog
        open={alertDialogOpen}
        onClose={() => setAlertDialogOpen(false)}
        onAdd={handleAddAlert}
        isPending={addAlert.isPending}
      />
    </>
  );
};

export default GuestPreferencesCard;
