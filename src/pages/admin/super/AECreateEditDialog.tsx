import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AE {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  notes: string | null;
  affiliate_code: string;
}

interface AECreateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ae: AE | null;
  onSuccess: () => void;
}

const AECreateEditDialog: React.FC<AECreateEditDialogProps> = ({
  open,
  onOpenChange,
  ae,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    notes: '',
    status: 'active',
  });

  useEffect(() => {
    if (ae) {
      setFormData({
        first_name: ae.first_name,
        last_name: ae.last_name,
        email: ae.email,
        password: '', // do not display password on edit
        phone: ae.phone || '',
        company: ae.company || '',
        notes: ae.notes || '',
        status: ae.status,
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        company: '',
        notes: '',
        status: 'active',
      });
    }
  }, [ae, open]);

  const generateAffiliateCode = (first: string, last: string) => {
    const cleanFirst = first.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3);
    const cleanLast = last.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
    const random = Math.floor(100 + Math.random() * 900); // 3 digits
    return `${cleanFirst}${cleanLast}_${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (ae) {
        // Edit Mode: Update account_executives table using supabaseAdmin to bypass RLS
        const { error: aeError } = await supabaseAdmin
          .from('account_executives')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone || null,
            company: formData.company || null,
            notes: formData.notes || null,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', ae.id);

        if (aeError) throw aeError;

        // Also update status in auth user metadata if needed (or keep it simple)
        toast({
          title: 'Account Executive mis à jour',
          description: `${formData.first_name} ${formData.last_name} a été modifié avec succès.`,
        });
      } else {
        // Create Mode:
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Le mot de passe doit faire au moins 6 caractères.');
        }

        // 1. Create Auth User
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            first_name: formData.first_name,
            last_name: formData.last_name,
          },
        });

        if (userError) throw userError;

        const newUserId = userData.user.id;

        // 2. Insert role record in user_roles using supabaseAdmin to bypass RLS
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: newUserId,
            role: 'account_executive',
            hotel_id: null,
          });

        if (roleError) {
          // Cleanup user if role assignment fails
          await supabaseAdmin.auth.admin.deleteUser(newUserId);
          throw roleError;
        }

        // 3. Insert record in account_executives using supabaseAdmin to bypass RLS
        const affiliateCode = generateAffiliateCode(formData.first_name, formData.last_name);
        const { error: aeError } = await supabaseAdmin
          .from('account_executives')
          .insert({
            user_id: newUserId,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone || null,
            company: formData.company || null,
            notes: formData.notes || null,
            status: formData.status,
            affiliate_code: affiliateCode,
          });

        if (aeError) {
          // Cleanup role and user if AE insert fails
          await supabaseAdmin.from('user_roles').delete().eq('user_id', newUserId);
          await supabaseAdmin.auth.admin.deleteUser(newUserId);
          throw aeError;
        }

        toast({
          title: 'Account Executive créé',
          description: `${formData.first_name} ${formData.last_name} a été créé avec le code ${affiliateCode}.`,
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error saving AE:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Une erreur est survenue lors de l\'enregistrement.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ae ? 'Modifier' : 'Créer'} un Account Executive</DialogTitle>
          <DialogDescription>
            {ae 
              ? 'Mettez à jour les informations du partenaire.' 
              : 'Remplissez ce formulaire pour créer un nouvel apporteur d\'affaires.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prénom <span className="text-red-500">*</span></label>
              <Input
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom <span className="text-red-500">*</span></label>
              <Input
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Adresse email <span className="text-red-500">*</span></label>
            <Input
              required
              type="email"
              disabled={!!ae}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
            />
          </div>

          {!ae && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe temporaire <span className="text-red-500">*</span></label>
              <Input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="******"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Téléphone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 6..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Société</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes administratives</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes concernant ce partenaire..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Enregistrement...
                </>
              ) : ae ? 'Mettre à jour' : 'Créer le compte'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AECreateEditDialog;
