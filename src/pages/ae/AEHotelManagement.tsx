import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Coins, 
  Check, 
  Calendar,
  Loader2,
  FileText,
  Edit
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuthContext';

interface AEProfile {
  id: string;
}

interface Lead {
  id: string;
  hotel_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  contract_value: number | null;
  commission_amount: number | null;
  commission_paid: boolean;
  notes: string | null;
  payment_type: string | null;
  created_at: string;
}

const AEHotelManagement: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AEProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Lead Creation Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hotel_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  // Lead Update Status/Notes Dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState('nouveau_lead');
  const [editNotes, setEditNotes] = useState('');

  const fetchLeads = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: aeData, error: aeError } = await supabase
        .from('account_executives')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (aeError) throw aeError;

      if (aeData) {
        setProfile(aeData);
        const { data: leadsData, error: leadsError } = await supabase
          .from('ae_hotel_leads')
          .select('*')
          .eq('ae_id', aeData.id)
          .order('created_at', { ascending: false });

        if (leadsError) throw leadsError;
        setLeads(leadsData || []);
      } else {
        // Fallback mock leads for demo
        setLeads([
          { id: '1', hotel_name: 'Grand Plaza Hotel', contact_name: 'Sarah Connor', contact_email: 'sarah@grandplaza.com', contact_phone: '+33 6 12 34 56 78', status: 'signe', contract_value: 12000, commission_amount: 1200, commission_paid: true, notes: 'Signed annual enterprise plan', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
          { id: '2', hotel_name: 'Boutique Hotel Palace', contact_name: 'Jean Dupont', contact_email: 'jean@hotelpalace.fr', contact_phone: '+33 7 98 76 54 32', status: 'proposition_envoyee', contract_value: 8000, commission_amount: 800, commission_paid: false, notes: 'Waiting for signature', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
          { id: '3', hotel_name: 'Sea Breeze Resort', contact_name: 'Mark Taylor', contact_email: 'mark@seabreeze.com', contact_phone: '+1 415 555 0199', status: 'demo_planifiee', contract_value: null, commission_amount: null, commission_paid: false, notes: 'Demo scheduled for July 15th', created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() },
          { id: '4', hotel_name: 'Alpine Lodge', contact_name: 'Anna Schmidt', contact_email: 'anna@alpinelodge.ch', contact_phone: '+41 44 123 4567', status: 'en_discussion', contract_value: null, commission_amount: null, commission_paid: false, notes: 'Interested in wellness and activities modules', created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() },
          { id: '5', hotel_name: 'Metropolitan Inn', contact_name: 'David Lee', contact_email: 'david@metroinn.com', contact_phone: '+33 6 11 22 33 44', status: 'nouveau_lead', contract_value: null, commission_amount: null, commission_paid: false, notes: 'Cold call lead, likes the AI chatbot demo', created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      toast({
        title: 'Error',
        description: 'Failed to load recommendations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user?.id]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      // In demo mode, we just append to the state list
      const newLead: Lead = {
        id: Math.random().toString(),
        hotel_name: formData.hotel_name,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        status: 'nouveau_lead',
        contract_value: null,
        commission_amount: null,
        commission_paid: false,
        notes: formData.notes || null,
        created_at: new Date().toISOString()
      };
      setLeads([newLead, ...leads]);
      setIsAddOpen(false);
      setFormData({ hotel_name: '', contact_name: '', contact_email: '', contact_phone: '', notes: '' });
      toast({
        title: 'Recommandation ajoutée',
        description: `${formData.hotel_name} a été enregistré avec succès (Mode Démo).`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('ae_hotel_leads')
        .insert({
          ae_id: profile.id,
          hotel_name: formData.hotel_name,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          status: 'nouveau_lead',
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: 'Recommandation ajoutée',
        description: `L'hôtel ${formData.hotel_name} a été enregistré avec succès.`,
      });
      setIsAddOpen(false);
      setFormData({ hotel_name: '', contact_name: '', contact_email: '', contact_phone: '', notes: '' });
      fetchLeads();
    } catch (err: any) {
      console.error('Error adding lead:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to add recommendation.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.notes || '');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    if (!profile) {
      // Demo mode fallback
      const updatedLeads = leads.map(l => 
        l.id === selectedLead.id 
          ? { ...l, status: editStatus, notes: editNotes || null }
          : l
      );
      setLeads(updatedLeads);
      setIsEditOpen(false);
      toast({
        title: 'Lead mis à jour',
        description: `Le statut de ${selectedLead.hotel_name} a été modifié (Mode Démo).`,
      });
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const { error } = await supabase
        .from('ae_hotel_leads')
        .update({
          status: editStatus,
          notes: editNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLead.id);

      if (error) throw error;

      toast({
        title: 'Lead mis à jour',
        description: `Le statut de ${selectedLead.hotel_name} a été modifié avec succès.`,
      });
      setIsEditOpen(false);
      fetchLeads();
    } catch (err: any) {
      console.error('Error updating lead:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update lead.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'signe': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'proposition_envoyee':
      case 'negociation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'demo_planifiee': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'en_discussion':
      case 'premier_contact': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'refuse':
      case 'perdu': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      nouveau_lead: 'Nouveau lead',
      premier_contact: 'Premier contact',
      en_discussion: 'En discussion',
      demo_planifiee: 'Démonstration planifiée',
      proposition_envoyee: 'Proposition envoyée',
      negociation: 'Négociation',
      signe: 'Contrat signé',
      refuse: 'Refusé',
      perdu: 'Perdu'
    };
    return labels[status] || status;
  };

  const getPaymentTypeLabel = (pt: string | null) => {
    if (!pt) return '—';
    const labels: Record<string, string> = {
      mensuel: 'Mensuel',
      trimestriel: 'Trimestriel',
      annuel: 'Annuel'
    };
    return labels[pt] || pt;
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.hotel_name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.contact_name && lead.contact_name.toLowerCase().includes(search.toLowerCase())) ||
      (lead.contact_email && lead.contact_email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestion des Hôtels</h1>
          <p className="text-sm text-muted-foreground">Déclarez vos opportunités et suivez l'avancement de vos recommandations.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Déclarer un hôtel
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-1.5 w-full md:max-w-md">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input 
            type="text" 
            placeholder="Rechercher par hôtel, contact, email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm w-full outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border rounded-lg px-3 py-1.5 text-sm outline-none w-full md:w-48"
          >
            <option value="all">Tous les statuts</option>
            <option value="nouveau_lead">Nouveau lead</option>
            <option value="premier_contact">Premier contact</option>
            <option value="en_discussion">En discussion</option>
            <option value="demo_planifiee">Démonstration planifiée</option>
            <option value="proposition_envoyee">Proposition envoyée</option>
            <option value="negociation">Négociation</option>
            <option value="signe">Contrat signé</option>
            <option value="refuse">Refusé</option>
            <option value="perdu">Perdu</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Chargement des recommandations...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">Aucun hôtel trouvé</p>
              <p className="text-sm">Commencez par ajouter une nouvelle recommandation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de l'hôtel</TableHead>
                    <TableHead>Contact principal</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Valeur Contrat</TableHead>
                    <TableHead>Type Paiement</TableHead>
                    <TableHead>Commission AE</TableHead>
                    <TableHead>Statut Commission</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-semibold">{lead.hotel_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-0.5 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground text-sm">{lead.contact_name || '—'}</span>
                          {lead.contact_email && (
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.contact_email}</span>
                          )}
                          {lead.contact_phone && (
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.contact_phone}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getStatusBadgeVariant(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {lead.contract_value ? `${lead.contract_value.toLocaleString()} €` : '—'}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        <span className="capitalize">{getPaymentTypeLabel(lead.payment_type)}</span>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {lead.commission_amount ? `${lead.commission_amount.toLocaleString()} €` : '—'}
                      </TableCell>
                      <TableCell>
                        {lead.status === 'signe' ? (
                          lead.commission_paid ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1">
                              <Check className="h-3 w-3" /> Payée
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 gap-1 border-amber-300">
                              En attente
                            </Badge>
                          )
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1.5" 
                          onClick={() => handleEditClick(lead)}
                        >
                          <Edit className="h-3.5 w-3.5" /> Gérer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Déclarer un hôtel / Prospect</DialogTitle>
            <DialogDescription>
              Entrez les informations de l'hôtel que vous souhaitez ajouter.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l'hôtel <span className="text-red-500">*</span></label>
              <Input 
                required 
                placeholder="Ex: Ritz Paris, Hotel Majestic"
                value={formData.hotel_name}
                onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact principal</label>
                <Input 
                  placeholder="Jean Dupont"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <Input 
                  placeholder="+33 6..."
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Adresse email du contact</label>
              <Input 
                type="email"
                placeholder="email@hotel.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes / Informations complémentaires</label>
              <Textarea 
                placeholder="Ex: Très intéressé par les modules Dining et AI Concierge. Souhaite une démo rapidement."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Enregistrement...
                  </>
                ) : 'Déclarer le prospect'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Status/Notes Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mettre à jour le lead : {selectedLead?.hotel_name}</DialogTitle>
            <DialogDescription>
              Faites évoluer le statut commercial et ajoutez des notes de suivi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut du lead</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="nouveau_lead">Nouveau lead</option>
                <option value="premier_contact">Premier contact</option>
                <option value="en_discussion">En discussion</option>
                <option value="demo_planifiee">Démonstration planifiée</option>
                <option value="proposition_envoyee">Proposition envoyée</option>
                <option value="negociation">Négociation</option>
                <option value="signe">Contrat signé</option>
                <option value="refuse">Refusé</option>
                <option value="perdu">Perdu</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes / Suivi commercial</label>
              <Textarea 
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Détaillez les derniers échanges..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmittingEdit}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmittingEdit}>
                {isSubmittingEdit ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Enregistrement...
                  </>
                ) : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AEHotelManagement;
