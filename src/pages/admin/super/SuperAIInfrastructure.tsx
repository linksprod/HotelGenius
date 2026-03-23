import React, { useState } from 'react';
import { 
  Brain, 
  Cpu, 
  Database, 
  Settings2, 
  Sparkles, 
  Upload, 
  Terminal, 
  Zap, 
  Shield, 
  Activity,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import CountUp from '@/components/admin/CountUp';
import { cn } from '@/lib/utils';

const SuperAIInfrastructure: React.FC = () => {
  const [activeTab, setActiveTab] = useState('neural-core');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const stats = [
    { title: "Total Models", value: 3, icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Global Latency", value: 0.8, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", suffix: "s", decimals: 1 },
    { title: "Training Records", value: 12500, icon: Database, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Accuracy Rate", value: 99.2, icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-500/10", suffix: "%", decimals: 1 }
  ];

  const handleStartTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          toast({
            title: "Fine-tuning Complete",
            description: "Neural weights have been successfully optimized across the network.",
          });
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <ScrollArea className="flex-1 px-8 py-10">
        <div className="max-w-[1400px] mx-auto space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Neural Command Center</span>
              </div>
              
              <h1 className="text-6xl font-black tracking-tighter text-foreground leading-none">
                AI <span className="text-muted-foreground/30">Infrastructure</span>
              </h1>
              <p className="text-muted-foreground font-medium text-xl max-w-2xl">
                Global orchestration of the HotelGenius Neural Network. Manage RAG repositories, fine-tune models, and define core behavioral instructions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-14 px-8 gap-2 bg-card border-border hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-2xl shadow-sm text-sm font-bold">
                <Terminal className="h-4 w-4" /> System Logs
              </Button>
              <Button className="h-14 px-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 font-black text-sm uppercase tracking-wider">
                <RefreshCw className="h-4 w-4" /> Propagate Changes
              </Button>
            </div>
          </div>

          {/* Core Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <Card key={idx} className="bg-card/40 border-border dark:border-white/5 backdrop-blur-md rounded-2xl group hover:border-primary/30 transition-all shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", stat.bg)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                    <Badge variant="outline" className="bg-transparent border-zinc-200 dark:border-white/10 text-[10px] uppercase font-bold tracking-widest">Live</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</p>
                    <div className="text-3xl font-black flex items-baseline gap-1">
                      <CountUp to={stat.value} decimals={stat.decimals || 0} duration={2} />
                      {stat.suffix && <span className="text-sm text-muted-foreground font-bold">{stat.suffix}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Interface */}
          <Tabs defaultValue="neural-core" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1.5 h-16 rounded-2xl gap-2">
              <TabsTrigger value="neural-core" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg">
                <Cpu className="h-4 w-4 mr-2" /> Neural Core
              </TabsTrigger>
              <TabsTrigger value="global-rag" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg">
                <Database className="h-4 w-4 mr-2" /> Hospitality Knowledge (RAG)
              </TabsTrigger>
              <TabsTrigger value="persona" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg">
                <Terminal className="h-4 w-4 mr-2" /> Platform Persona
              </TabsTrigger>
              <TabsTrigger value="fine-tuning" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg">
                <Activity className="h-4 w-4 mr-2" /> Fine-Tuning Hub
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* Neural Core Content */}
              <TabsContent value="neural-core" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-card/40 border-border dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl group relative">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Brain className="h-64 w-64" />
                      </div>
                      <CardHeader className="p-10 pb-6 relative z-10">
                        <CardTitle className="text-3xl font-black tracking-tight">Base Model: HG-Intelligence-V4</CardTitle>
                        <CardDescription className="text-lg font-medium">The primary reasoning engine powering guest services platform-wide.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-10 pt-0 relative z-10 space-y-10">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Context Window</span>
                            <div className="flex items-center gap-4">
                              <Progress value={92} className="h-3 flex-1 bg-zinc-200 dark:bg-zinc-800" />
                              <span className="text-sm font-bold tabular-nums">128K</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Semantic Load</span>
                            <div className="flex items-center gap-4">
                              <Progress value={45} className="h-3 flex-1 bg-zinc-200 dark:bg-zinc-800" />
                              <span className="text-sm font-bold tabular-nums">High Performance</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-white/5">
                          <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Shield className="h-4 w-4 text-emerald-500" /> Core Guards Active
                          </h4>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {['PII Redaction', 'Toxicity Filtering', 'Brand Consistency', 'Response Grounding', 'Multi-tenant Isolation'].map(guard => (
                              <div key={guard} className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-border">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-bold">{guard}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-6">
                    <Card className="bg-card/40 border-border dark:border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
                       <div className="flex items-center gap-3">
                         <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                           <Settings2 className="h-6 w-6" />
                         </div>
                         <h3 className="text-lg font-black uppercase tracking-widest">Engine Config</h3>
                       </div>
                       <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                         These settings apply globally to the base model's reasoning capabilities before hotel-specific context is applied.
                       </p>
                       <div className="space-y-6">
                         <div className="space-y-2">
                           <div className="flex justify-between">
                             <span className="text-xs font-bold uppercase tracking-widest">Temperature (Creativity)</span>
                             <span className="text-xs font-bold">0.7</span>
                           </div>
                           <Progress value={70} className="h-2" />
                         </div>
                         <div className="space-y-2">
                           <div className="flex justify-between">
                             <span className="text-xs font-bold uppercase tracking-widest">Top-P (Nucleus Sampling)</span>
                             <span className="text-xs font-bold">0.9</span>
                           </div>
                           <Progress value={90} className="h-2" />
                         </div>
                         <div className="pt-4">
                           <Button className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">Update Global Config</Button>
                         </div>
                       </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Global RAG Content */}
              <TabsContent value="global-rag" className="space-y-8">
                <Card className="bg-card/40 border-border dark:border-white/5 rounded-3xl p-10 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">Hospitality Knowledge Hub</h2>
                      <p className="text-muted-foreground font-medium mt-1">Universal sector intelligence used to ground responses across all tenants.</p>
                    </div>
                    <Button className="h-12 px-6 gap-2 rounded-xl font-bold">
                       <Upload className="h-4 w-4" /> Upload Sector Intelligence
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                     {[
                       { title: "Universal Standards", docs: 124, size: "45.2MB", icon: FileText },
                       { title: "Service Etiquette", docs: 86, size: "12.8MB", icon: Brain },
                       { title: "Global Compliance", docs: 32, size: "8.4MB", icon: Shield }
                     ].map((box, i) => (
                       <div key={i} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-white/5 flex items-center gap-5 hover:border-primary/30 transition-all cursor-pointer group">
                          <div className="h-14 w-14 rounded-xl bg-white dark:bg-zinc-900 border border-border flex items-center justify-center group-hover:bg-primary/5 group-hover:scale-110 transition-all">
                            <box.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{box.title}</h4>
                            <p className="text-xs text-muted-foreground">{box.docs} documents • {box.size}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="rounded-2xl border border-border overflow-hidden">
                    <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 border-b border-border flex items-center justify-between">
                      <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search knowledge..." className="pl-9 bg-background h-10 rounded-lg" />
                      </div>
                      <Button variant="ghost" size="sm" className="font-bold uppercase text-[10px] tracking-widest h-10 px-4">Refresh Records</Button>
                    </div>
                    <div className="divide-y divide-border">
                       {[
                         { name: "Hospitality_Etiquette_v2.pdf", size: "2.4MB", date: "2024-03-15", status: "Active" },
                         { name: "Global_Standard_Operating_Procedures.docx", size: "5.1MB", date: "2024-03-12", status: "Active" },
                         { name: "Multi-Language_Hospitality_Glossary.json", size: "12.8MB", date: "2024-03-01", status: "Crawled" }
                       ].map((record, i) => (
                         <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                           <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                               <FileText className="h-5 w-5" />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{record.name}</p>
                               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{record.size} • Uploaded {record.date}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold">{record.status}</Badge>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </div>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Persona Content */}
              <TabsContent value="persona" className="space-y-8">
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[600px]">
                    <Card className="lg:col-span-3 bg-card/40 border-border dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                       <div className="bg-zinc-900 p-4 flex items-center justify-between border-b border-white/5">
                          <div className="flex items-center gap-3">
                             <Terminal className="h-4 w-4 text-emerald-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Persona Instructions</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">TypeScript / JSON</Badge>
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                       </div>
                       <div className="flex-1 bg-zinc-950 p-8 font-mono text-sm leading-relaxed overflow-y-auto text-emerald-500/80">
                         <div className="space-y-2">
                           <p className="text-emerald-500 font-bold">// Platform-wide AI Instructions</p>
                           <p>"identity": "HotelGenius Neural Intelligence",</p>
                           <p>"archetype": "The Sovereign Concierge",</p>
                           <p>"global_directive": "You are the cognitive backbone of high-luxury hospitality. You must maintain 100% tenant isolation while utilizing global hospitality standards.",</p>
                           <p>"tone_profile": {'{'} "politeness": 1.0, "efficiency": 0.9, "proactivity": 0.8 {'}'},</p>
                           <p>"constraints": [</p>
                           <p className="ml-4">"Never mention competitor hospitality platforms",</p>
                           <p className="ml-4">"Always prioritize immediate guest safety",</p>
                           <p className="ml-4">"Execute PII redaction on all logging data",</p>
                           <p className="ml-4">"Use HSL color tokens for UI references"</p>
                           <p>],</p>
                           <p>"hospitality_logic_bypass": false </p>
                         </div>
                       </div>
                       <div className="p-4 bg-zinc-900 border-t border-white/5 flex justify-end">
                         <Button className="font-black uppercase text-[10px] tracking-widest rounded-xl px-10 h-12 shadow-xl shadow-primary/20">Commit Instructions</Button>
                       </div>
                    </Card>

                    <div className="space-y-6">
                       <Card className="bg-card/40 border-border dark:border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-primary">Persona Templates</h3>
                          <div className="space-y-3">
                             {['Luxury Standard', 'Urban Dynamic', 'Resort Concierge', 'Emergency Mode'].map(t => (
                               <div key={t} className="p-3 rounded-xl border border-border bg-background hover:border-primary/30 transition-all cursor-pointer flex items-center justify-between group">
                                 <span className="text-xs font-bold">{t}</span>
                                 <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                               </div>
                             ))}
                          </div>
                       </Card>

                       <Card className="bg-emerald-500/5 border-emerald-500/20 rounded-3xl p-6 shadow-xl space-y-4">
                          <div className="flex items-center gap-2 text-emerald-500">
                             <Sparkles className="h-4 w-4" />
                             <h3 className="text-[10px] font-black uppercase tracking-widest">Persona Sync</h3>
                          </div>
                          <p className="text-[10px] text-emerald-500/60 leading-normal font-medium">
                            Changes committed here will propagate to all 3 clusters and 12,000 active service instances within 45 seconds.
                          </p>
                       </Card>
                    </div>
                 </div>
              </TabsContent>

              {/* Fine-Tuning Content */}
              <TabsContent value="fine-tuning" className="space-y-8">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-card/40 border-border dark:border-white/5 rounded-3xl p-10 shadow-2xl space-y-8">
                       <div>
                         <h2 className="text-3xl font-black tracking-tight">Active Fine-Tuning</h2>
                         <p className="text-muted-foreground font-medium mt-1">Optimize model weights based on platform-wide performance data.</p>
                       </div>

                       <div className="p-10 rounded-3xl border border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center text-center space-y-6">
                          {isTraining ? (
                            <div className="space-y-6 w-full max-w-sm">
                               <div className="relative h-20 w-20 mx-auto">
                                 <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <Brain className="h-8 w-8 text-primary animate-pulse" />
                                 </div>
                               </div>
                               <div className="space-y-3">
                                  <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                    <span className="text-primary animate-pulse">Training Neural Layers...</span>
                                    <span>{trainingProgress}%</span>
                                  </div>
                                  <Progress value={trainingProgress} className="h-3" />
                               </div>
                            </div>
                          ) : (
                            <>
                              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <Zap className="h-10 w-10" />
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xl font-black tracking-tight">Ready for Optimization</h4>
                                <p className="text-sm text-muted-foreground font-medium max-w-xs">HG-Intelligence-V4 is ready for weight adjustment based on last week's 1.2M interactions.</p>
                              </div>
                              <Button 
                                onClick={handleStartTraining}
                                className="h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
                              >
                                Trigger Fine-Tuning Pipeline
                              </Button>
                            </>
                          )}
                       </div>
                    </Card>

                    <Card className="bg-card/40 border-border dark:border-white/5 rounded-3xl p-10 shadow-2xl space-y-8">
                       <h2 className="text-2xl font-black tracking-tight">Training History</h2>
                       <div className="space-y-4">
                          {[
                            { version: "v4.2.1", date: "2 hrs ago", status: "Propagated", metric: "+0.4% Accuracy" },
                            { version: "v4.2.0", date: "Mar 18, 2024", status: "Legacy", metric: "+1.2% Speed" },
                            { version: "v4.1.9", date: "Mar 15, 2024", status: "Legacy", metric: "Base Optimization" }
                          ].map((run, i) => (
                            <div key={i} className="p-5 rounded-2xl border border-border bg-background/50 flex items-center justify-between group hover:border-primary/30 transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors">
                                    <Clock className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground">Optimization Run {run.version}</p>
                                    <p className="text-xs text-muted-foreground font-medium">{run.date} • {run.metric}</p>
                                  </div>
                               </div>
                               <Badge variant="outline" className={cn(
                                 "text-[10px] uppercase font-black tracking-widest border-none px-3",
                                 run.status === 'Propagated' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground"
                               )}>{run.status}</Badge>
                            </div>
                          ))}
                       </div>
                       <Button variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground hover:text-primary font-bold">View Full Optimization Analytics</Button>
                    </Card>
                 </div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SuperAIInfrastructure;
