import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { toast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  custom_domain: string | null;
  is_chain?: boolean;
  parent_hotel_id?: string | null;
  status?: string | null;
}

interface EditHotelDialogProps {
  hotel: Hotel | null;
  allHotels: Hotel[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditHotelDialog: React.FC<EditHotelDialogProps> = ({
  hotel,
  allHotels,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [address, setAddress] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [logoUrl, setLogoUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [isChain, setIsChain] = useState(false);
  const [parentHotelId, setParentHotelId] = useState<string | null>(null);
  const [status, setStatus] = useState('essai_en_cours');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (hotel) {
      setName(hotel.name || '');
      setSlug(hotel.slug || '');
      setAddress(hotel.address || '');
      setPrimaryColor(hotel.primary_color || '#6366f1');
      setSecondaryColor(hotel.secondary_color || '#8b5cf6');
      setLogoUrl(hotel.logo_url || '');
      setCustomDomain(hotel.custom_domain || '');
      setIsChain(hotel.is_chain || false);
      setParentHotelId(hotel.parent_hotel_id || null);
      setStatus(hotel.status || 'essai_en_cours');
      setConfirmDelete(false);
    }
  }, [hotel, open]);

  if (!hotel) return null;

  // Filter out the current hotel from parents list to avoid self-referencing
  const availableParents = allHotels.filter(h => h.id !== hotel.id);

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast({
        title: 'Error',
        description: 'Name and slug are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabaseAdmin
        .from('hotels')
        .update({
          name,
          slug,
          address: address || null,
          primary_color: primaryColor || null,
          secondary_color: secondaryColor || null,
          logo_url: logoUrl || null,
          custom_domain: customDomain || null,
          is_chain: isChain,
          parent_hotel_id: parentHotelId || null,
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', hotel.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Hotel updated successfully',
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error updating hotel',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabaseAdmin.rpc('delete_hotel_cascade', {
        target_hotel_id: hotel.id
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Hotel deleted successfully',
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error deleting hotel',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Hotel & Chain settings</DialogTitle>
          <DialogDescription>
            Modify general identity, branding, custom domain and chain hierarchy.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug" className="text-right">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="col-span-3 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="logo" className="text-right">Logo URL</Label>
            <Input
              id="logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="col-span-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="domain" className="text-right">Custom Domain</Label>
            <Input
              id="domain"
              placeholder="e.g. Fiesta-hotel.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="col-span-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <div className="col-span-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essai_en_cours">Essai en cours</SelectItem>
                  <SelectItem value="contrat_signe">Contrat signé</SelectItem>
                  <SelectItem value="negociation">Négociation</SelectItem>
                  <SelectItem value="refuse">Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Branding Colors</Label>
            <div className="col-span-3 flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Primary</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono">{primaryColor}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">Secondary</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono">{secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 my-2" />

          {/* Hierarchy Section */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isChain" className="text-right font-semibold">Is Chain / Parent?</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Switch
                id="isChain"
                checked={isChain}
                onCheckedChange={setIsChain}
              />
              <span className="text-xs text-muted-foreground">
                Enable to show a custom multi-hotel landing page (like Dar Jerba Hotels)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parentHotel" className="text-right">Parent Hotel</Label>
            <div className="col-span-3">
              <Select
                value={parentHotelId || 'none'}
                onValueChange={(val) => setParentHotelId(val === 'none' ? null : val)}
              >
                <SelectTrigger id="parentHotel">
                  <SelectValue placeholder="Select parent hotel (if any)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Independent / Main Group)</SelectItem>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name} ({parent.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <div className="flex-1 flex justify-start">
            <Button
              type="button"
              variant={confirmDelete ? "destructive" : "outline"}
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : confirmDelete ? 'Confirm Delete?' : 'Delete'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="gap-1.5"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditHotelDialog;
