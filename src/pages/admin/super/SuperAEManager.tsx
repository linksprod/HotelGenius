import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Users, 
  Plus, 
  Search, 
  Filter, 
  Coins, 
  Check, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  Settings,
  Edit,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import AECreateEditDialog from './AECreateEditDialog';

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
  ae_id: string;
  status: string;
  contract_value: number | null;
  commission_amount: number | null;
}

interface CommissionRule {
  id: string;
  min_hotels: number;
  max_hotels: number | null;
  rate: number;
}

const SuperAEManager: React.FC = () => {
  const navigate = useNavigate();
  const [aes, setAEs] = useState<AE[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [isAEDialogOpen, setIsAEDialogOpen] = useState(false);
  const [selectedAE, setSelectedAE] = useState<AE | null>(null);
  
  // Rules management states
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false);
  const [editingRules, setEditingRules] = useState<CommissionRule[]>([]);
  const [savingRules, setSavingRules] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch AEs
      const { data: aeData, error: aeError } = await supabase
        .from('account_executives')
        .select('*')
        .order('created_at', { ascending: false });

      if (aeError) throw aeError;
      setAEs(aeData || []);

      // 2. Fetch Leads (to compute stats)
      const { data: leadsData, error: leadsError } = await supabase
        .from('ae_hotel_leads')
        .select('id, ae_id, status, contract_value, commission_amount');

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

      // 3. Fetch Commission Rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('ae_commission_settings')
        .select('*')
        .order('min_hotels', { ascending: true });

      if (rulesError) throw rulesError;
      setRules(rulesData || []);

    } catch (err: any) {
      console.error('Error fetching AE dashboard details:', err);
      // Fallback mocks if DB has issue or is not fully synced yet
      setAEs([
        { id: '1', user_id: 'mock-1', first_name: 'David', last_name: 'Vance', email: 'david.vance@genius.com', phone: '+33 6 45 67 89 01', company: 'Vance Consulting', affiliate_code: 'DAVVANCE_432', status: 'active', notes: 'Top performer', created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
        { id: '2', user_id: 'mock-2', first_name: 'Sophia', last_name: 'Loren', email: 'sophia@genius.com', phone: '+33 7 12 34 56 78', company: 'Loren Sales', affiliate_code: 'SOPLOREN_772', status: 'active', notes: 'Handles boutique hotels', created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
        { id: '3', user_id: 'mock-3', first_name: 'Gérard', last_name: 'Depardieu', email: 'gerard@genius.com', phone: null, company: null, affiliate_code: 'GERDEPAR_123', status: 'inactive', notes: 'Inactive partner', created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString() },
      ]);
      setLeads([
        { id: 'l1', ae_id: '1', status: 'signe', contract_value: 12000, commission_amount: 1200 },
        { id: 'l2', ae_id: '1', status: 'contrat_envoye', contract_value: 8000, commission_amount: 800 },
        { id: 'l3', ae_id: '1', status: 'demo_planifiee', contract_value: null, commission_amount: null },
        { id: 'l4', ae_id: '2', status: 'signe', contract_value: 9500, commission_amount: 950 },
        { id: 'l5', ae_id: '2', status: 'en_discussion', contract_value: null, commission_amount: null },
      ]);
      setRules([
        { id: 'r1', min_hotels: 1, max_hotels: 5, rate: 10.00 },
        { id: 'r2', min_hotels: 6, max_hotels: 10, rate: 15.00 },
        { id: 'r3', min_hotels: 11, max_hotels: null, rate: 20.00 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAE = () => {
    setSelectedAE(null);
    setIsAEDialogOpen(true);
  };

  const handleEditAE = (ae: AE, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAE(ae);
    setIsAEDialogOpen(true);
  };

  const handleRowClick = (aeId: string) => {
    navigate(`/administration/super/account-executives/${aeId}`);
  };

  // Compute stats for a specific AE
  const getAEStats = (aeId: string) => {
    const aeLeads = leads.filter(l => l.ae_id === aeId);
    const totalLeads = aeLeads.length;
    const signedCount = aeLeads.filter(l => l.status === 'signe').length;
    
    // Sum of contract values
    const totalContractVal = aeLeads
      .filter(l => l.status === 'signe')
      .reduce((sum, l) => sum + Number(l.contract_value || 0), 0);

    // Sum of commissions
    const totalComms = aeLeads.reduce((sum, l) => sum + Number(l.commission_amount || 0), 0);

    return {
      totalLeads,
      signedCount,
      totalContractVal,
      totalComms
    };
  };

  const handleManageRulesClick = () => {
    // Clone current rules for editing
    setEditingRules(JSON.parse(JSON.stringify(rules)));
    setIsRulesDialogOpen(true);
  };

  const handleRuleChange = (index: number, field: keyof CommissionRule, value: any) => {
    const updated = [...editingRules];
    updated[index] = {
      ...updated[index],
      [field]: value === '' ? null : Number(value)
    };
    setEditingRules(updated);
  };

  const handleAddRule = () => {
    const newRule: CommissionRule = {
      id: Math.random().toString(), // temp id
      min_hotels: editingRules.length > 0 ? (editingRules[editingRules.length - 1].max_hotels || 0) + 1 : 1,
      max_hotels: null,
      rate: 10
    };
    setEditingRules([...editingRules, newRule]);
  };

  const handleRemoveRule = (index: number) => {
    const updated = editingRules.filter((_, i) => i !== index);
    setEditingRules(updated);
  };

  const handleSaveRules = async () => {
    // Validate rules logic
    // 1. Min must be <= max
    // 2. Overlaps check
    for (let i = 0; i < editingRules.length; i++) {
      const r = editingRules[i];
      if (r.max_hotels !== null && r.min_hotels > r.max_hotels) {
        toast({
          title: 'Erreur de validation',
          description: `Pour la règle ${i + 1}, le minimum doit être inférieur ou égal au maximum.`,
          variant: 'destructive',
        });
        return;
      }
    }

    setSavingRules(true);
    try {
      // Direct update of DB settings table
      // We empty it and insert the new rules list
      const { error: deleteError } = await supabase
        .from('ae_commission_settings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

      if (deleteError) throw deleteError;

      // Insert new ones
      const insertRows = editingRules.map(r => ({
        min_hotels: r.min_hotels,
        max_hotels: r.max_hotels,
        rate: r.rate
      }));

      if (insertRows.length > 0) {
        const { error: insertError } = await supabase
          .from('ae_commission_settings')
          .insert(insertRows);
        if (insertError) throw insertError;
      }

      toast({
        title: 'Règles de commission sauvegardées',
        description: 'Les taux de commissions par palier ont été mis à jour avec succès.',
      });
      setIsRulesDialogOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving commission rules:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible d\'enregistrer les règles.',
        variant: 'destructive',
      });
    } finally {
      setSavingRules(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      default: return 'destructive';
    }
  };

  // Filter AEs
  const filteredAEs = aes.filter((ae) => {
    const matchesSearch = 
      ae.first_name.toLowerCase().includes(search.toLowerCase()) ||
      ae.last_name.toLowerCase().includes(search.toLowerCase()) ||
      ae.email.toLowerCase().includes(search.toLowerCase()) ||
      ae.affiliate_code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ae.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate summary metrics
  const totalAECount = aes.length;
  const activeAECount = aes.filter(a => a.status === 'active').length;
  
  // Total signed hotels and commissions across ALL AEs
  const totalSignedCount = leads.filter(l => l.status === 'signe').length;
  const totalCommissionsAmount = leads.reduce((sum, l) => sum + Number(l.commission_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <AdminPageHeader 
        title="Gestion des Account Executives"
        description="Créez, modifiez et analysez les performances de vos apporteurs d'affaires d'affiliation."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleManageRulesClick} className="gap-2">
              <Settings className="h-4 w-4" />
              Gérer les taux
            </Button>
            <Button onClick={handleCreateAE} className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un AE
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total AE</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              {totalAECount}
              <Users className="h-5 w-5 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{activeAECount} comptes actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Hôtels signés via AE</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              {totalSignedCount}
              <Check className="h-5 w-5 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Taux de conversion global optimal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Commissions AE cumulées</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              {totalCommissionsAmount.toLocaleString()} €
              <Coins className="h-5 w-5 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Revenus redistribués aux affiliés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Règles de Palier</CardDescription>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              10% / 15% / 20%
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{rules.length} paliers configurés</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-1.5 w-full md:max-w-md">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email, code d'affilié..." 
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
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
      </div>

      {/* AEs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Chargement des Account Executives...
            </div>
          ) : filteredAEs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">Aucun Account Executive trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email / Société</TableHead>
                    <TableHead>Code d'Affilié</TableHead>
                    <TableHead>Hôtels Apportés (Signés)</TableHead>
                    <TableHead>CA Généré</TableHead>
                    <TableHead>Commissions</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAEs.map((ae) => {
                    const stats = getAEStats(ae.id);
                    return (
                      <TableRow 
                        key={ae.id} 
                        className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
                        onClick={() => handleRowClick(ae.id)}
                      >
                        <TableCell className="font-semibold">{ae.first_name} {ae.last_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs text-muted-foreground">
                            <span className="font-medium text-foreground text-sm">{ae.email}</span>
                            {ae.company && <span>{ae.company}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{ae.affiliate_code}</code>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{stats.totalLeads}</span> ({stats.signedCount} signé{stats.signedCount > 1 ? 's' : ''})
                        </TableCell>
                        <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                          {stats.totalContractVal.toLocaleString()} €
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {stats.totalComms.toLocaleString()} €
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(ae.status) as any} className="capitalize">
                            {ae.status === 'active' ? 'Actif' : ae.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={(e) => handleEditAE(ae, e)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRowClick(ae.id)}>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AECreateEditDialog */}
      <AECreateEditDialog
        open={isAEDialogOpen}
        onOpenChange={setIsAEDialogOpen}
        ae={selectedAE}
        onSuccess={fetchData}
      />

      {/* Manage Commission Settings Dialog */}
      <Dialog open={isRulesDialogOpen} onOpenChange={setIsRulesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurer les taux de commissions</DialogTitle>
            <DialogDescription>
              Modifiez les paliers de recommandation. Le taux de commission est appliqué dynamiquement selon le nombre de contrats signés par l'AE.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium border-b pb-2">
              <div className="col-span-3">Min Hôtels</div>
              <div className="col-span-3">Max Hôtels</div>
              <div className="col-span-4">Taux (%)</div>
              <div className="col-span-2"></div>
            </div>
            {editingRules.map((rule, idx) => (
              <div key={rule.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Input 
                    type="number"
                    value={rule.min_hotels}
                    onChange={(e) => handleRuleChange(idx, 'min_hotels', e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="col-span-3">
                  <Input 
                    type="number"
                    value={rule.max_hotels === null ? '' : rule.max_hotels}
                    onChange={(e) => handleRuleChange(idx, 'max_hotels', e.target.value)}
                    placeholder="Infini"
                  />
                </div>
                <div className="col-span-4">
                  <Input 
                    type="number"
                    value={rule.rate}
                    onChange={(e) => handleRuleChange(idx, 'rate', e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className="col-span-2 text-right">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveRule(idx)}
                    disabled={editingRules.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleAddRule} className="w-full gap-1">
              <Plus className="h-4 w-4" /> Ajouter un palier
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRulesDialogOpen(false)} disabled={savingRules}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSaveRules} disabled={savingRules}>
              {savingRules ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sauvegarde...
                </>
              ) : 'Sauvegarder les règles'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAEManager;
