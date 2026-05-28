import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Settings, Users, Download } from 'lucide-react';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

interface DemoSettings {
  id: string;
  is_enabled: boolean;
  time_limit_minutes: number;
  redirect_url: string;
  email_required: boolean;
  expiration_message: string;
}

interface DemoSession {
  id: string;
  email: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  ip_address: string | null;
  user_agent: string | null;
}

const DemoManager = () => {
  const [settings, setSettings] = useState<DemoSettings | null>(null);
  const [sessions, setSessions] = useState<DemoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDemoSettings();
    fetchDemoSessions();
  }, []);

  const fetchDemoSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching demo settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load demo settings"
      });
    }
  };

  const fetchDemoSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching demo sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDemoSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('demo_settings')
        .update({
          is_enabled: settings.is_enabled,
          time_limit_minutes: settings.time_limit_minutes,
          redirect_url: settings.redirect_url,
          email_required: settings.email_required,
          expiration_message: settings.expiration_message
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Demo settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving demo settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save demo settings"
      });
    } finally {
      setSaving(false);
    }
  };

  const exportEmails = () => {
    const emails = sessions.filter(s => s.email).map(s => s.email);
    const uniqueEmails = [...new Set(emails)];
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Email,First Seen,Last Activity\n' +
      uniqueEmails.map(email => {
        const userSessions = sessions.filter(s => s.email === email);
        const firstSeen = userSessions[userSessions.length - 1]?.started_at;
        const lastActivity = userSessions[0]?.started_at;
        return `${email},${firstSeen},${lastActivity}`;
      }).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'demo_emails.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading demo settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">Failed to load demo settings</div>
      </div>
    );
  }

  const todaysSessions = sessions.filter(s => 
    new Date(s.started_at).toDateString() === new Date().toDateString()
  );

  const totalEmails = new Set(sessions.filter(s => s.email).map(s => s.email)).size;

  return (
    <div className="p-6">
      <div className="mb-6">
        <AdminPageHeader
          title="Demo Settings"
          description="Manage demo limitations and view analytics"
          icon={<Settings className="h-5 w-5 text-primary" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Demo Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Demo Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="demo-enabled">Enable Demo Mode</Label>
              <Switch
                id="demo-enabled"
                checked={settings.is_enabled}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, is_enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Time Limit (minutes)</Label>
              <div className="px-3">
                <Slider
                  value={[settings.time_limit_minutes]}
                  onValueChange={(value) => 
                    setSettings({ ...settings, time_limit_minutes: value[0] })
                  }
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>1 min</span>
                  <span>{settings.time_limit_minutes} minutes</span>
                  <span>30 min</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect-url">Redirect URL</Label>
              <Input
                id="redirect-url"
                value={settings.redirect_url}
                onChange={(e) => 
                  setSettings({ ...settings, redirect_url: e.target.value })
                }
                placeholder="https://hotelgenius.app"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email-required">Require Email</Label>
              <Switch
                id="email-required"
                checked={settings.email_required}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, email_required: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration-message">Expiration Message</Label>
              <Textarea
                id="expiration-message"
                value={settings.expiration_message}
                onChange={(e) => 
                  setSettings({ ...settings, expiration_message: e.target.value })
                }
                rows={3}
              />
            </div>

            <Button 
              onClick={saveDemoSettings} 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Analytics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demo Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">{todaysSessions.length}</div>
                  <div className="text-sm text-muted-foreground">Today's Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">{totalEmails}</div>
                  <div className="text-sm text-muted-foreground">Total Emails</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">{sessions.length}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">
                    {Math.round((sessions.filter(s => s.completed_at).length / sessions.length) * 100) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
              
              <Button 
                onClick={exportEmails} 
                variant="outline" 
                className="w-full mt-4"
                disabled={totalEmails === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Emails ({totalEmails})
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{session.email || 'Anonymous'}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.started_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm">
                      {session.duration_seconds 
                        ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`
                        : 'In Progress'
                      }
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No demo sessions yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoManager;