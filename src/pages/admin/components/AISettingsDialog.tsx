import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Sparkles, 
  Brain, 
  Settings2,
  Loader2,
  Cpu,
  Shield,
  MessageSquare,
  Database,
  Upload,
  FileText,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useHotelSettings } from '@/hooks/admin/useHotelSettings';
import { useKnowledgeBase } from '@/hooks/admin/useKnowledgeBase';
import { cn } from '@/lib/utils';

interface AISettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'general' | 'knowledge';
}

export const AISettingsDialog: React.FC<AISettingsDialogProps> = ({ 
  isOpen, 
  onClose,
  defaultTab = 'general'
}) => {
  const { config, isLoading, isSaving, updateConfig } = useHotelSettings();
  const { docs, isProcessing, uploadKnowledge, deleteKnowledge, refresh, isLoading: isKnowledgeLoading } = useKnowledgeBase();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    ai_name: '',
    ai_personality: '',
    ai_instructions: ''
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (config) {
      setFormData({
        ai_name: config.ai_name || 'Aura',
        ai_personality: config.ai_personality || 'Professional, warm, and highly efficient.',
        ai_instructions: config.ai_instructions || ''
      });
    }
  }, [config]);

  const handleSave = async () => {
    await updateConfig(formData);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadKnowledge(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-zinc-950 border-white/10 text-white min-h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight tracking-widest uppercase">AI Orchestrator</DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium italic">Command Aura's consciousness and service intelligence.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col">
          <TabsList className="bg-white/5 border border-white/10 w-full justify-start p-1 mb-6">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-widest px-6">
              <Sparkles className="h-3 w-3 mr-2" /> Persona
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-widest px-6">
              <Database className="h-3 w-3 mr-2" /> Knowledge Core
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {isLoading ? (
              <div className="py-20 flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Agent Identity</Label>
                    <div className="relative">
                      <Bot className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                      <Input 
                        value={formData.ai_name}
                        onChange={(e) => setFormData({ ...formData, ai_name: e.target.value })}
                        className="pl-10 bg-white/5 border-white/10 h-12 focus-visible:ring-primary/50 font-bold"
                        placeholder="e.g., Aura"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Engine</Label>
                    <div className="flex items-center gap-3 h-12 px-4 rounded-md bg-white/5 border border-white/10">
                      <Cpu className="h-5 w-5 text-emerald-500" />
                      <span className="text-xs font-black uppercase tracking-tight text-zinc-300">HotelGenius Neural Core v7</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Behavioral Tone</Label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                    <Input 
                      value={formData.ai_personality}
                      onChange={(e) => setFormData({ ...formData, ai_personality: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 h-12 focus-visible:ring-primary/50 font-medium"
                      placeholder="e.g., Attentive, luxury-focused, and proactive."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">High-Level Directives</Label>
                  <div className="relative">
                    <Brain className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
                    <Textarea 
                      value={formData.ai_instructions}
                      onChange={(e) => setFormData({ ...formData, ai_instructions: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 min-h-[180px] focus-visible:ring-primary/50 leading-relaxed font-black text-sm"
                      placeholder="Provide specific SOPs or hotel rules for Aura to adhere to..."
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="knowledge" className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary">Training Documentation</h3>
                  <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Sync hotel fact sheets or service guides into AI long-term memory.</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg text-zinc-500 hover:text-primary transition-all"
                  onClick={refresh}
                  disabled={isKnowledgeLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", isKnowledgeLoading && "animate-spin")} />
                </Button>
              </div>

              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                accept=".txt,.pdf,.doc,.docx"
              />
              
              <Button 
                variant="outline" 
                className="w-full border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase text-[10px] h-20 rounded-xl tracking-[0.2em]"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-3 text-white" />
                ) : (
                  <Upload className="h-5 w-5 mr-3" />
                )}
                {isProcessing ? "Ingesting Intelligence..." : "Sync Documentation"}
              </Button>

              <div className="grid grid-cols-1 gap-2">
                {isKnowledgeLoading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 text-zinc-600 animate-spin" />
                  </div>
                ) : docs.length > 0 ? (
                  docs.map((doc) => (
                    <div 
                      key={doc.id}
                      className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-white line-clamp-1">{doc.source_name}</span>
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">
                            Ingested {new Date(doc.created_at).toLocaleDateString()} • {doc.metadata?.size ? `${(doc.metadata.size / 1024).toFixed(1)} KB` : 'Active'}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        onClick={() => deleteKnowledge(doc.source_name || '')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-zinc-700 opacity-50" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Aura is awaiting data</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t border-white/10 pt-6 mt-4 flex !justify-between items-center">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Autonomous Guard Active</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={onClose} className="text-zinc-500 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest px-8">
              Close
            </Button>
            {activeTab === 'general' && (
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest px-10 h-11 shadow-xl shadow-primary/20"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <RefreshCw className="h-4 w-4 mr-3" />}
                Sync Directives
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
