import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  TableRow,
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
  ArrowLeft, 
  Mail, 
  Phone, 
  Coins, 
  Check, 
  Calendar,
  Loader2,
  TrendingUp,
  FileText,
  User,
  Plus,
  Edit,
  DollarSign
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

interface AE {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  affiliate_code: string;
  status: string;
  notes: string | null;
  created_at: string;
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

interface CommissionRule {
  min_hotels: number;
  max_hotels: number | null;
  rate: number;
}

const AEDetailPage: React.FC = () => {
  const { aeId } = useParams<{ aeId: string }>();
  const navigate = useNavigate();
  const [ae, setAE] = useState<AE | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Lead Status/Commission dialog state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('nouveau_lead');
  const [editContractValue, setEditContractValue] = useState('');
  const [editPaymentType, setEditPaymentType] = useState('mensuel');
  const [editCommissionAmount, setEditCommissionAmount] = useState('');
  const [editCommissionPaid, setEditCommissionPaid] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [savingLead, setSavingLead] = useState(false);

  const fetchData = async () => {
    if (!aeId) return;
    setLoading(true);
    try {
      // 1. Fetch AE Profile
      const { data: aeData, error: aeError } = await supabase
        .from('account_executives')
        .select('*')
        .eq('id', aeId)
        .maybeSingle();

      if (aeError) throw aeError;

      if (aeData) {
        setAE(aeData);

        // 2. Fetch Leads
        const { data: leadsData, error: leadsError } = await supabase
          .from('ae_hotel_leads')
          .select('*')
          .eq('ae_id', aeData.id)
          .order('created_at', { ascending: false });

        if (leadsError) throw leadsError;
        setLeads(leadsData || []);
      } else {
        // Fallback mockup AE for demo
        setAE({
          id: aeId,
          user_id: 'mock-uid',
          first_name: 'David',
          last_name: 'Vance',
          email: 'david.vance@genius.com',
          phone: '+33 6 45 67 89 01',
          company: 'Vance Consulting',
          affiliate_code: 'DAVVANCE_432',
          status: 'active',
          notes: 'Top performing sales representative',
          created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
        });
        setLeads([
          { id: '1', hotel_name: 'Grand Plaza Hotel', contact_name: 'Sarah Connor', contact_email: 'sarah@grandplaza.com', contact_phone: '+33 6 12 34 56 78', status: 'signe', contract_value: 12000, commission_amount: 1200, commission_paid: true, notes: 'Signed annual enterprise plan', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
          { id: '2', hotel_name: 'Boutique Hotel Palace', contact_name: 'Jean Dupont', contact_email: 'jean@hotelpalace.fr', contact_phone: '+33 7 98 76 54 32', status: 'contrat_envoye', contract_value: 8000, commission_amount: 800, commission_paid: false, notes: 'Waiting for signature', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
          { id: '3', hotel_name: 'Sea Breeze Resort', contact_name: 'Mark Taylor', contact_email: 'mark@seabreeze.com', contact_phone: '+1 415 555 0199', status: 'demo_planifiee', contract_value: null, commission_amount: null, commission_paid: false, notes: 'Demo scheduled for July 15th', created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() },
        ]);
      }

      // 3. Fetch Commission Rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('ae_commission_settings')
        .select('*')
        .order('min_hotels', { ascending: true });

      if (rulesError) throw rulesError;
      setCommissionRules(rulesData || [
        { min_hotels: 1, max_hotels: 5, rate: 10.00 },
        { min_hotels: 6, max_hotels: 10, rate: 15.00 },
        { min_hotels: 11, max_hotels: null, rate: 20.00 },
      ]);

    } catch (err: any) {
      console.error('Error fetching AE details:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [aeId]);

  // Dynamic commission calculator
  // Looks up rate based on currently signed hotel count
  const calculateCommissionForValue = (value: number, currentLeadId: string) => {
    // Count how many OTHER leads are already signed
    const signedOtherCount = leads.filter(l => l.status === 'signe' && l.id !== currentLeadId).length;
    // We add 1 for the current lead being signed
    const totalSigned = signedOtherCount + 1;

    // Find applicable rule
    const rule = commissionRules.find(r => {
      const minMatch = totalSigned >= r.min_hotels;
      const maxMatch = r.max_hotels === null || totalSigned <= r.max_hotels;
      return minMatch && maxMatch;
    });

    const rate = rule ? Number(rule.rate) : 10.00; // fallback to 10%
    return {
      rate,
      amount: Math.round(value * (rate / 100))
    };
  };

  const handleEditLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditContractValue(lead.contract_value?.toString() || '');
    setEditPaymentType(lead.payment_type || 'mensuel');
    setEditCommissionAmount(lead.commission_amount?.toString() || '');
    setEditCommissionPaid(lead.commission_paid);
    setEditNotes(lead.notes || '');
    setIsEditLeadOpen(true);
  };

  const handleContractValueChange = (valStr: string) => {
    setEditContractValue(valStr);
    const val = Number(valStr);
    if (!isNaN(val) && val > 0 && selectedLead) {
      const calc = calculateCommissionForValue(val, selectedLead.id);
      setEditCommissionAmount(calc.amount.toString());
    } else {
      setEditCommissionAmount('');
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !ae) return;
    setSavingLead(true);

    const val = editContractValue ? Number(editContractValue) : null;
    const comm = editCommissionAmount ? Number(editCommissionAmount) : null;
    const pType = editStatus === 'signe' ? editPaymentType : null;

    try {
      const { error } = await supabase
        .from('ae_hotel_leads')
        .update({
          contract_value: val,
          commission_amount: comm,
          commission_paid: editCommissionPaid,
          payment_type: pType,
          notes: editNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLead.id);

      if (error) throw error;

      // Handle commission payment record insertion if commission is newly signed
      if (editStatus === 'signe' && comm !== null) {
        // Check if there is an existing commission record
        const { data: comms } = await supabase
          .from('ae_commissions')
          .select('id')
          .eq('lead_id', selectedLead.id)
          .maybeSingle();

        if (!comms) {
          // Create a new commission log entry
          await supabase
            .from('ae_commissions')
            .insert({
              ae_id: ae.id,
              lead_id: selectedLead.id,
              amount: comm,
              status: editCommissionPaid ? 'paid' : 'approved',
              paid_at: editCommissionPaid ? new Date().toISOString() : null,
              notes: `Commission de ${comm} € générée pour la signature de ${selectedLead.hotel_name}`
            });
        } else {
          // Update status of existing commission log entry
          await supabase
            .from('ae_commissions')
            .update({
              amount: comm,
              status: editCommissionPaid ? 'paid' : 'approved',
              paid_at: editCommissionPaid ? new Date().toISOString() : null,
            })
            .eq('id', comms.id);
        }
      }

      toast({
        title: 'Recommandation mise à jour',
        description: `Le prospect ${selectedLead.hotel_name} a été modifié.`,
      });
      setIsEditLeadOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving lead:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de mettre à jour.',
        variant: 'destructive',
      });
    } finally {
      setSavingLead(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement du profil...</span>
      </div>
    );
  }

  if (!ae) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/administration/super/account-executives')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div className="p-8 text-center text-muted-foreground">Account Executive introuvable.</div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalLeads = leads.length;
  const signedLeads = leads.filter(l => l.status === 'signe');
  const signedCount = signedLeads.length;
  const totalContractVal = signedLeads.reduce((sum, l) => sum + Number(l.contract_value || 0), 0);
  const totalComms = leads.reduce((sum, l) => sum + Number(l.commission_amount || 0), 0);
  const paidComms = leads.filter(l => l.commission_paid).reduce((sum, l) => sum + Number(l.commission_amount || 0), 0);
  const pendingComms = totalComms - paidComms;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/administration/super/account-executives')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div className="h-5 w-px bg-border" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{ae.first_name} {ae.last_name}</h1>
          <p className="text-sm text-muted-foreground">Apporteur d'affaires · Code : <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{ae.affiliate_code}</code></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email</span>
              <p className="text-sm font-medium flex items-center gap-1.5"><Mail className="h-4 w-4 text-muted-foreground" /> {ae.email}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Téléphone</span>
              <p className="text-sm font-medium flex items-center gap-1.5"><Phone className="h-4 w-4 text-muted-foreground" /> {ae.phone || 'Non renseigné'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Société</span>
              <p className="text-sm font-medium flex items-center gap-1.5"><Building2 className="h-4 w-4 text-muted-foreground" /> {ae.company || 'Aucune'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Statut du compte</span>
              <div>
                <Badge variant={ae.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                  {ae.status === 'active' ? 'Actif' : ae.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Notes</span>
              <p className="text-sm text-muted-foreground italic">{ae.notes || 'Aucune note administrative.'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary Card */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Synthèse des Performances
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-1">
              <span className="text-xs text-muted-foreground">Prospects apportés</span>
              <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
            </div>
            <div className="border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-1">
              <span className="text-xs text-muted-foreground">Contrats signés</span>
              <p className="text-2xl font-bold text-foreground">{signedCount}</p>
            </div>
            <div className="border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-1">
              <span className="text-xs text-muted-foreground">CA Généré</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalContractVal.toLocaleString()} €</p>
            </div>
            <div className="border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-1">
              <span className="text-xs text-muted-foreground">Total Commissions</span>
              <p className="text-2xl font-bold text-primary">{totalComms.toLocaleString()} €</p>
            </div>
            <div className="border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-1">
              <span className="text-xs text-muted-foreground">Commissions Payées</span>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{paidComms.toLocaleString()} €</p>
            </div>
            <div className="border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/10 space-y-1">
              <span className="text-xs text-muted-foreground">Commissions Restantes</span>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{pendingComms.toLocaleString()} €</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Hôtels apportés par ce partenaire
          </CardTitle>
          <CardDescription>
            Gérez le statut de ses prospects, entrez les valeurs de contrat et validez les commissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Aucun hôtel apporté par cet AE.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de l'hôtel</TableHead>
                    <TableHead>Contact</TableHead>
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
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-semibold">{lead.hotel_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span className="font-medium text-foreground text-sm">{lead.contact_name || '—'}</span>
                          {lead.contact_email && <span>{lead.contact_email}</span>}
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
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleEditLeadClick(lead)}>
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

      {/* Edit Lead Dialog */}
      <Dialog open={isEditLeadOpen} onOpenChange={setIsEditLeadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gérer la recommandation : {selectedLead?.hotel_name}</DialogTitle>
            <DialogDescription>
              Gérez les informations financières, le type de paiement et validez le paiement des commissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Statut du lead (Géré par l'AE)</label>
              <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg border font-medium text-sm text-foreground capitalize">
                {getStatusLabel(editStatus)}
              </div>
            </div>

            {editStatus === 'signe' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      Valeur du contrat (€) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="number"
                      value={editContractValue}
                      onChange={(e) => handleContractValueChange(e.target.value)}
                      placeholder="12000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type de paiement <span className="text-red-500">*</span></label>
                    <select
                      value={editPaymentType}
                      onChange={(e) => setEditPaymentType(e.target.value)}
                      className="w-full bg-background border rounded-lg px-3 py-2 text-sm outline-none"
                    >
                      <option value="mensuel">Mensuel</option>
                      <option value="trimestriel">Trimestriel</option>
                      <option value="annuel">Annuel</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">
                    Commission suggérée (€)
                  </label>
                  <Input
                    type="number"
                    value={editCommissionAmount}
                    onChange={(e) => setEditCommissionAmount(e.target.value)}
                    placeholder="Calcul automatique..."
                  />
                </div>
              </div>
            )}

            {editStatus === 'signe' && (
              <div className="flex items-center space-x-2 pt-2 animate-in fade-in duration-200">
                <input
                  type="checkbox"
                  id="paid-checkbox"
                  checked={editCommissionPaid}
                  onChange={(e) => setEditCommissionPaid(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="paid-checkbox" className="text-sm font-medium cursor-pointer">
                  Marquer la commission comme déjà payée à l'AE
                </label>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes / Suivi administratif</label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Historique des discussions, détails du contrat..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditLeadOpen(false)} disabled={savingLead}>
                Annuler
              </Button>
              <Button type="submit" disabled={savingLead}>
                {savingLead ? (
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

export default AEDetailPage;
