import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Coins, 
  Copy, 
  Check, 
  Award,
  Clock,
  CheckCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import StatisticCard from '@/components/admin/StatisticCard';

interface AEProfile {
  id: string;
  first_name: string;
  last_name: string;
  affiliate_code: string;
  status: string;
}

interface LeadStats {
  totalLeads: number;
  signedCount: number;
  conversionRate: number;
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
}

const AEDashboard: React.FC = () => {
  const { user, userData } = useAuth();
  const [profile, setProfile] = useState<AEProfile | null>(null);
  const [stats, setStats] = useState<LeadStats>({
    totalLeads: 0,
    signedCount: 0,
    conversionRate: 0,
    totalCommissions: 0,
    paidCommissions: 0,
    pendingCommissions: 0,
  });
  const [commissionTier, setCommissionTier] = useState({
    name: '1 à 5 hôtels (10%)',
    rate: 10,
    nextTier: '6 à 10 hôtels (15%)',
    progress: 0,
    signedNeededForNext: 6,
  });
  const [rules, setRules] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAEData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // 1. Fetch AE Profile
        const { data: aeData, error: aeError } = await supabase
          .from('account_executives')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (aeError) throw aeError;

        if (aeData) {
          setProfile(aeData);

          // 2. Fetch Leads
          const { data: leadsData, error: leadsError } = await supabase
            .from('ae_hotel_leads')
            .select('*')
            .eq('ae_id', aeData.id)
            .order('created_at', { ascending: false });

          if (leadsError) throw leadsError;

          // 3. Fetch Commissions
          const { data: commsData, error: commsError } = await supabase
            .from('ae_commissions')
            .select('*')
            .eq('ae_id', aeData.id);

          if (commsError) throw commsError;

          // 4. Fetch Commission settings
          const { data: settingsData, error: settingsError } = await supabase
            .from('ae_commission_settings')
            .select('*')
            .order('min_hotels', { ascending: true });

          if (settingsError) throw settingsError;
          const activeRules = settingsData || [];
          setRules(activeRules);

          // Process stats
          const totalLeads = leadsData?.length || 0;
          const signedCount = leadsData?.filter((l: any) => l.status === 'signe').length || 0;
          const conversionRate = totalLeads > 0 ? Math.round((signedCount / totalLeads) * 100) : 0;

          const totalCommissions = commsData?.reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
          const paidCommissions = commsData?.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
          const pendingCommissions = commsData?.filter((c: any) => c.status === 'pending' || c.status === 'approved').reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;

          setStats({
            totalLeads,
            signedCount,
            conversionRate,
            totalCommissions,
            paidCommissions,
            pendingCommissions
          });

          setRecentLeads(leadsData?.slice(0, 5) || []);

          // Calculate tiers based on signedCount and dynamic rules
          const currentRule = activeRules.find(r => {
            const minOk = signedCount >= r.min_hotels;
            const maxOk = r.max_hotels === null || signedCount <= r.max_hotels;
            return minOk && maxOk;
          });

          const nextRule = activeRules.find(r => r.min_hotels > signedCount);

          let currentTierName = '';
          let currentRate = 10;
          let nextTierName = 'Niveau Maximum';
          let progress = 100;
          let needed = 0;

          if (currentRule) {
            currentRate = Number(currentRule.rate);
            if (currentRule.max_hotels === null) {
              currentTierName = `${currentRule.min_hotels}+ hôtels (${currentRate}%)`;
            } else {
              currentTierName = `${currentRule.min_hotels} à ${currentRule.max_hotels} hôtels (${currentRate}%)`;
            }
          } else if (activeRules.length > 0 && signedCount < activeRules[0].min_hotels) {
            currentTierName = `Moins de ${activeRules[0].min_hotels} hôtels (0%)`;
            currentRate = 0;
          } else {
            currentTierName = '1 à 5 hôtels (10%)';
            currentRate = 10;
          }

          if (nextRule) {
            const nextRate = Number(nextRule.rate);
            if (nextRule.max_hotels === null) {
              nextTierName = `${nextRule.min_hotels}+ hôtels (${nextRate}%)`;
            } else {
              nextTierName = `${nextRule.min_hotels} à ${nextRule.max_hotels} hôtels (${nextRate}%)`;
            }

            needed = nextRule.min_hotels - signedCount;
            
            const currentMin = currentRule ? currentRule.min_hotels : 0;
            const currentMax = currentRule && currentRule.max_hotels !== null ? currentRule.max_hotels : nextRule.min_hotels - 1;
            const totalInTier = currentMax - currentMin + 1;
            const signedInTier = signedCount - currentMin + 1;
            progress = totalInTier > 0 ? Math.round((signedInTier / totalInTier) * 100) : 0;
          } else {
            nextTierName = 'Niveau Maximum';
            progress = 100;
            needed = 0;
          }

          setCommissionTier({
            name: currentTierName,
            rate: currentRate,
            nextTier: nextTierName,
            progress: Math.min(progress, 100),
            signedNeededForNext: Math.max(needed, 0),
          });
        } else {
          // If no profile found, we will display mockup data for demo purposes
          // to avoid a blank screen when the user visits the page.
          setProfile({
            id: 'demo-id',
            first_name: userData?.first_name || 'Demo',
            last_name: userData?.last_name || 'AE',
            affiliate_code: 'GENIUS_AE_99',
            status: 'active'
          });
          setStats({
            totalLeads: 12,
            signedCount: 4,
            conversionRate: 33,
            totalCommissions: 4500,
            paidCommissions: 3000,
            pendingCommissions: 1500
          });
          setCommissionTier({
            name: '1 à 5 hôtels (10%)',
            rate: 10,
            nextTier: '6 à 10 hôtels (15%)',
            progress: 80, // 4 out of 5
            signedNeededForNext: 1
          });
          setRecentLeads([
            { id: '1', hotel_name: 'Grand Plaza Hotel', contact_name: 'Sarah Connor', status: 'signe', contract_value: 12000, commission_amount: 1200, created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
            { id: '2', hotel_name: 'Boutique Hotel Palace', contact_name: 'Jean Dupont', status: 'contrat_envoye', contract_value: 8000, commission_amount: 800, created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
            { id: '3', hotel_name: 'Sea Breeze Resort', contact_name: 'Mark Taylor', status: 'demo_planifiee', contract_value: null, commission_amount: null, created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() },
          ]);
          setRules([
            { min_hotels: 1, max_hotels: 5, rate: 10 },
            { min_hotels: 6, max_hotels: 10, rate: 15 },
            { min_hotels: 11, max_hotels: null, rate: 20 },
          ]);
        }
      } catch (err: any) {
        console.error('Error fetching AE dashboard details:', err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAEData();
  }, [user?.id]);

  const getAffiliateLink = () => {
    if (!profile) return '';
    const base = window.location.origin;
    return `${base}/login?ref=${profile.affiliate_code}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getAffiliateLink());
    setCopied(true);
    toast({
      title: 'Lien copié !',
      description: 'Le lien d\'affiliation a été copié dans votre presse-papiers.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'signe': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'contrat_envoye': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'demo_planifiee': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'en_discussion': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'refuse':
      case 'perdu': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      prospect: 'Prospect',
      en_discussion: 'En discussion',
      demo_planifiee: 'Démo planifiée',
      contrat_envoye: 'Contrat envoyé',
      signe: 'Signé',
      refuse: 'Refusé',
      perdu: 'Perdu'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Bonjour, {profile?.first_name || 'Account Executive'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivez vos recommandations, vos prospects et vos commissions d'affiliation.
        </p>
      </div>

      {/* Affiliate Link Card */}
      <Card className="border border-primary/20 bg-primary/5 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">Votre lien d'affiliation unique</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                Partagez ce lien avec des directeurs d'hôtels. Lorsqu'ils s'enregistrent et souscrivent à un abonnement Hotel Genius via ce lien, vous recevez une commission.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-background border rounded-lg p-1.5 w-full md:max-w-md">
              <input 
                type="text" 
                readOnly 
                value={getAffiliateLink()} 
                className="bg-transparent text-sm px-2 flex-1 outline-none text-muted-foreground"
              />
              <Button onClick={handleCopy} size="sm" className="shrink-0 gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copié' : 'Copier'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard 
          title="Total Recommandations" 
          value={stats.totalLeads} 
          icon={Building2} 
          iconColor="blue"
          subtitle="Hôtels apportés au total"
          loading={loading}
        />
        <StatisticCard 
          title="Hôtels Signés" 
          value={stats.signedCount} 
          icon={CheckCircle} 
          iconColor="emerald"
          subtitle={`${stats.conversionRate}% de taux de conversion`}
          loading={loading}
        />
        <StatisticCard 
          title="Commissions Payées" 
          value={stats.paidCommissions} 
          suffix=" €"
          icon={Coins} 
          iconColor="amber"
          subtitle="Montant perçu à ce jour"
          loading={loading}
        />
        <StatisticCard 
          title="Commissions en Attente" 
          value={stats.pendingCommissions} 
          suffix=" €"
          icon={Clock} 
          iconColor="purple"
          subtitle="Approuvées ou en attente"
          loading={loading}
        />
      </div>

      {/* Commission Level and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Niveau de Commission
            </CardTitle>
            <CardDescription>
              Votre pourcentage de commission augmente selon le nombre de contrats d'hôtels signés.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm text-muted-foreground">Palier Actuel</span>
                <p className="text-xl font-semibold text-primary">{commissionTier.name}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Prochain Palier</span>
                <p className="text-base font-medium">{commissionTier.nextTier}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${commissionTier.progress}%` }} 
                />
              </div>
              {commissionTier.signedNeededForNext > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Plus que <strong>{commissionTier.signedNeededForNext}</strong> contrat{commissionTier.signedNeededForNext > 1 ? 's' : ''} signé{commissionTier.signedNeededForNext > 1 ? 's' : ''} pour passer au prochain niveau.
                </p>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Vous avez atteint le niveau maximal de commission d'affiliation ! ({commissionTier.rate}%)
                </p>
              )}
            </div>

            {/* Commission Rules Table */}
            <div className="border rounded-lg overflow-hidden text-sm">
              <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900 p-2 font-medium border-b">
                <div>Nombre d'hôtels signés</div>
                <div>Taux de commission</div>
              </div>
              {rules.map((rule, idx) => (
                <div 
                  key={rule.id || idx} 
                  className={`grid grid-cols-2 p-2 border-b last:border-0 ${
                    stats.signedCount >= rule.min_hotels && (rule.max_hotels === null || stats.signedCount <= rule.max_hotels)
                      ? 'bg-primary/5 font-medium text-primary'
                      : ''
                  }`}
                >
                  <div>
                    {rule.max_hotels === null 
                      ? `${rule.min_hotels}+ hôtels` 
                      : `${rule.min_hotels} à ${rule.max_hotels} hôtels`
                    }
                  </div>
                  <div className={stats.signedCount >= rule.min_hotels && (rule.max_hotels === null || stats.signedCount <= rule.max_hotels) ? 'font-bold' : 'font-semibold'}>
                    {rule.rate} %
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Recommendations */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recommandations Récentes
            </CardTitle>
            <CardDescription>
              Derniers prospects apportés.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeads.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Aucune recommandation récente.
              </div>
            ) : (
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{lead.hotel_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.contact_name || 'Contact inconnu'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeVariant(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AEDashboard;
