import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Save, GripVertical, ArrowUp, ArrowDown, Megaphone, Eye, EyeOff, Pencil, X } from 'lucide-react';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  created_at: string;
  updated_at: string;
}

const ICON_OPTIONS = [
  'Coins', 'Star', 'Zap', 'MessageSquare', 'Award', 'Gift', 'Info', 'Shield',
  'Heart', 'Bell', 'Calendar', 'Users', 'Building2', 'Globe', 'Sparkles',
];

const COLOR_OPTIONS = [
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
];

const EMPTY_BULLETIN: Omit<Bulletin, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  icon: 'Info',
  color: 'blue',
  items: [{ label: '', value: '' }],
  order_index: 0,
  is_published: false,
};

const PlatformBulletinsManager: React.FC = () => {
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor state
  const [editing, setEditing] = useState<Bulletin | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState(EMPTY_BULLETIN);

  const fetchBulletins = async () => {
    setLoading(true);
    const { data, error } = await supabaseAdmin
      .from('platform_bulletins')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) setBulletins(data as Bulletin[]);
    setLoading(false);
  };

  useEffect(() => { fetchBulletins(); }, []);

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setFormData({
      ...EMPTY_BULLETIN,
      order_index: bulletins.length > 0 ? Math.max(...bulletins.map(b => b.order_index)) + 1 : 1,
    });
  };

  const openEdit = (b: Bulletin) => {
    setCreating(false);
    setEditing(b);
    setFormData({
      title: b.title,
      icon: b.icon,
      color: b.color,
      items: b.items.length > 0 ? b.items : [{ label: '', value: '' }],
      order_index: b.order_index,
      is_published: b.is_published,
    });
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setFormData(EMPTY_BULLETIN);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        icon: formData.icon,
        color: formData.color,
        items: formData.items.filter(i => i.label.trim() || i.value.trim()),
        order_index: formData.order_index,
        is_published: formData.is_published,
      };

      if (creating) {
        const { error } = await supabaseAdmin
          .from('platform_bulletins')
          .insert(payload);
        if (error) throw error;
        toast({ title: '✅ Created!', description: `"${payload.title}" has been created.` });
      } else if (editing) {
        const { error } = await supabaseAdmin
          .from('platform_bulletins')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
        toast({ title: '✅ Updated!', description: `"${payload.title}" has been updated.` });
      }

      closeForm();
      fetchBulletins();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Save failed', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const { error } = await supabaseAdmin.from('platform_bulletins').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🗑️ Deleted', description: `"${title}" has been removed.` });
      fetchBulletins();
    }
  };

  const togglePublish = async (b: Bulletin) => {
    const { error } = await supabaseAdmin
      .from('platform_bulletins')
      .update({ is_published: !b.is_published })
      .eq('id', b.id);
    if (!error) fetchBulletins();
  };

  const moveOrder = async (b: Bulletin, direction: 'up' | 'down') => {
    const sorted = [...bulletins].sort((a, c) => a.order_index - c.order_index);
    const idx = sorted.findIndex(x => x.id === b.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const other = sorted[swapIdx];
    await supabaseAdmin.from('platform_bulletins').update({ order_index: other.order_index }).eq('id', b.id);
    await supabaseAdmin.from('platform_bulletins').update({ order_index: b.order_index }).eq('id', other.id);
    fetchBulletins();
  };

  // Item helpers
  const addItem = () => setFormData(f => ({ ...f, items: [...f.items, { label: '', value: '' }] }));
  const removeItem = (idx: number) => setFormData(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, field: keyof BulletinItem, val: string) =>
    setFormData(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: val } : item) }));

  const getColorClass = (color: string) => {
    const map: Record<string, string> = {
      amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
      blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
      emerald: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      purple: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
      red: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
      orange: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
      cyan: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
      rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    };
    return map[color] || map.blue;
  };

  const isEditorOpen = creating || editing !== null;

  return (
    <div className="flex-1 space-y-6 p-6">
      <AdminPageHeader
        title="Platform Bulletins"
        description="Manage global informational sections visible to all hotel administrators. These are read-only for hotels and invisible to guests."
        icon={<Megaphone className="h-5 w-5 text-primary" />}
      />

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{bulletins.length} bulletin{bulletins.length !== 1 ? 's' : ''}</Badge>
          <span>·</span>
          <span>{bulletins.filter(b => b.is_published).length} published</span>
        </div>
        <Button onClick={openCreate} disabled={isEditorOpen} className="gap-2">
          <Plus className="h-4 w-4" /> New Bulletin
        </Button>
      </div>

      {/* Editor Form */}
      {isEditorOpen && (
        <Card className="border-2 border-primary/30 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{creating ? '📝 New Bulletin' : `✏️ Editing: ${editing?.title}`}</CardTitle>
              <Button variant="ghost" size="icon" onClick={closeForm} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="bulletin-title">Title *</Label>
              <Input
                id="bulletin-title"
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Points de Dépense (Cash-to-Points)"
                className="text-base font-medium"
              />
            </div>

            {/* Icon + Color */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={v => setFormData(f => ({ ...f, icon: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(icon => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={formData.color} onValueChange={v => setFormData(f => ({ ...f, color: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${c.class}`} />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch
                  id="bulletin-publish"
                  checked={formData.is_published}
                  onCheckedChange={v => setFormData(f => ({ ...f, is_published: v }))}
                />
                <Label htmlFor="bulletin-publish" className="cursor-pointer">
                  {formData.is_published ? 'Published ✅' : 'Draft ⏸️'}
                </Label>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Entries</Label>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5 h-7 text-xs">
                  <Plus className="h-3 w-3" /> Add Entry
                </Button>
              </div>
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start p-3 rounded-lg border bg-muted/20">
                  <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={item.label}
                        onChange={e => updateItem(idx, 'label', e.target.value)}
                        placeholder="Label (e.g. 1 TND dépensé)"
                        className="h-9"
                      />
                      <Input
                        value={item.value}
                        onChange={e => updateItem(idx, 'value', e.target.value)}
                        placeholder="Value (e.g. +5 Points)"
                        className="h-9 font-semibold"
                      />
                    </div>
                    <Textarea
                      value={item.note || ''}
                      onChange={e => updateItem(idx, 'note', e.target.value)}
                      placeholder="Optional note / details..."
                      rows={1}
                      className="text-xs resize-none"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Save */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={closeForm}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> {creating ? 'Create Bulletin' : 'Save Changes'}</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulletins List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : bulletins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Megaphone className="h-12 w-12 mb-4 opacity-30" />
          <p className="font-semibold text-foreground text-lg">No bulletins yet</p>
          <p className="text-sm mt-1">Click "New Bulletin" to create your first informational section.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bulletins.map((b, idx) => (
            <Card key={b.id} className={`transition-all ${!b.is_published ? 'opacity-60 border-dashed' : ''}`}>
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Order controls */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveOrder(b, 'up')}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === bulletins.length - 1} onClick={() => moveOrder(b, 'down')}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Color accent + info */}
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${getColorClass(b.color)}`}>
                  <span className="text-lg font-bold">{b.order_index}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{b.title}</h3>
                    {b.is_published ? (
                      <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">Published</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.items.length} entr{b.items.length !== 1 ? 'ies' : 'y'} · Icon: {b.icon} · Updated: {new Date(b.updated_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title={b.is_published ? 'Unpublish' : 'Publish'} onClick={() => togglePublish(b)}>
                    {b.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)} disabled={isEditorOpen}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{b.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>This bulletin will be permanently removed from all hotel admin dashboards.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(b.id, b.title)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlatformBulletinsManager;
