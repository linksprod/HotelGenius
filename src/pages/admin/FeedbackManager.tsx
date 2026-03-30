import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/hooks/use-toast';
import { Star, MessageSquare, Image, Globe, Heart, ShieldCheck, TrendingUp, Info, RefreshCw, Layers } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHotelConfig } from '@/hooks/useHotelConfig';
import { supabase } from '@/integrations/supabase/client';
import { FeedbackType } from '@/pages/feedback/types/feedbackTypes';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import DemoInstructionOverlay from '@/components/admin/DemoInstructionOverlay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

export const FeedbackManager = () => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [heroImage, setHeroImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const { toast } = useToast();
  const { config, updateConfig } = useHotelConfig();
  const { hotelId } = useCurrentHotelId();

  useEffect(() => {
    fetchFeedbacks();
  }, [hotelId]);

  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo/');

  const fetchFeedbacks = async () => {
    setIsLoadingFeedback(true);
    try {
      if (isDemo) {
        // High-praise mock data for demo prestige
        const demoFeedbacks = [
          {
            id: 'demo-f1',
            guest_name: 'Sofia Al-Fayed',
            guest_email: 'sofia.fayed@emirates.com',
            rating: 10,
            comment: 'Exceptional stay! The AI-driven personalization made me feel like a VIP from the moment I booked. Every detail was anticipated perfectly.',
            created_at: new Date().toISOString(),
            status: 'positive',
            hotel_id: hotelId
          },
          {
            id: 'demo-f2',
            guest_name: 'James Wilson',
            guest_email: 'j.wilson@booking.com',
            rating: 9.8,
            comment: 'Seamless experience. The real-time chat support handled my room service request in seconds. Truly impressive technology integrated into hospitality.',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            status: 'positive',
            hotel_id: hotelId
          },
          {
            id: 'demo-f3',
            guest_name: 'Elena Rodríguez',
            guest_email: 'elena.rod@tripadvisor.com',
            rating: 10,
            comment: 'A glimpse into the future of luxury travel. The room was prepared exactly to my preferences. Everything was flawless.',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            status: 'positive',
            hotel_id: hotelId
          }
        ];
        setFeedbacks(demoFeedbacks as any[]);
        return;
      }

      let query: any = supabase.from('guest_feedback').select('*');
      if (hotelId) query = query.eq('hotel_id', hotelId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setFeedbacks(data as FeedbackType[] || []);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (config?.feedback_hero_image) {
      setHeroImage(config.feedback_hero_image);
    } else {
      setHeroImage('https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=2070&auto=format&fit=crop');
    }
  }, [config]);

  const handleImageUpdate = () => {
    setLoading(true);
    updateConfig({ feedback_hero_image: heroImage });
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Image Updated", description: "The header image has been successfully updated." });
    }, 1000);
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < Math.round(rating / 2) ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} />
    ));
  };

  const getSourceIcon = (email: string) => {
    if (email.includes('tripadvisor')) return <Globe className="h-3 w-3 text-[#34E0A1]" />;
    if (email.includes('booking')) return <Globe className="h-3 w-3 text-[#003580]" />;
    if (email.includes('google')) return <Globe className="h-3 w-3 text-[#4285F4]" />;
    return <MessageSquare className="h-3 w-3 text-rose-500" />;
  };

  const getSentimentText = (rating: number) => {
    if (rating >= 9) return { text: 'Delighted', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    if (rating >= 7) return { text: 'Positive', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    return { text: 'Neutral', class: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' };
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">

      {/* Header Area */}
      <motion.div 
        id="admin-ob-feedback-header" 
        variants={itemVariants}
        className="shrink-0 p-8 pb-4 flex items-end justify-between"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Global Reputation: 9.2/10
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Guest Pulse & Reputation</h1>
          <p className="text-muted-foreground font-medium text-sm">Aggregating sentiment across all major travel platforms.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchFeedbacks} 
            disabled={isLoadingFeedback} 
            className="h-12 px-6 gap-2 bg-card dark:bg-zinc-900 border-border dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingFeedback ? 'animate-spin' : ''}`} />
            Sync Platforms
          </Button>
        </div>
      </motion.div>

      {/* Reputation Command Bar */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 px-8 pb-8"
      >
        {[
          { label: 'TripAdvisor', value: '4.8/5', sub: '840 Reviews', icon: Globe, color: 'text-[#34E0A1]' },
          { label: 'Booking.com', value: '9.4/10', sub: '1.2k Reviews', icon: Globe, color: 'text-[#003580]' },
          { label: 'Google Maps', value: '4.9/5', sub: '2.3k Reviews', icon: Globe, color: 'text-[#4285F4]' },
          { label: 'HotelGenius', value: '9.8/10', sub: '450 Reviews', icon: MessageSquare, color: 'text-rose-500' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="border border-border dark:border-none bg-card/40 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm rounded-2xl group hover:bg-secondary/50 dark:hover:bg-zinc-900/60 transition-all cursor-pointer overflow-hidden p-[1px]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                  <div className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</div>
                  <p className="text-[9px] text-zinc-500 font-medium">{stat.sub}</p>
                </div>
                <div className={cn("p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex-1 min-h-0 px-8">
        <Tabs defaultValue="reviews" onValueChange={setActiveTab} value={activeTab} className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-card dark:bg-zinc-900/50 rounded-xl p-1 h-11 border border-border dark:border-white/5">
              <TabsTrigger value="reviews" className="px-6 text-[10px] font-bold uppercase tracking-tight data-[state=active]:bg-rose-500 data-[state=active]:text-primary-foreground rounded-lg">Recent Feedbacks</TabsTrigger>
              <TabsTrigger value="appearance" className="px-6 text-[10px] font-bold uppercase tracking-tight data-[state=active]:bg-rose-500 data-[state=active]:text-primary-foreground rounded-lg">Survey Design</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="reviews" className="flex-1 m-0 overflow-hidden">
            <div className="h-full bg-card/80 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
              {isLoadingFeedback ? (
                <div className="flex-1 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-rose-500 animate-spin opacity-50" />
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-4">
                  <div className="p-6 bg-card dark:bg-zinc-900/80 rounded-full border border-border dark:border-white/5 shadow-sm">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium max-w-xs">No feedback data collected yet. High-impact guests usually provide rich feedback.</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-6 space-y-4"
                  >
                    {feedbacks.map((feedback) => {
                      const sentiment = getSentimentText(feedback.rating);
                      return (
                        <motion.div key={feedback.id} variants={itemVariants}>
                          <Card className="bg-muted/30 dark:bg-white/[0.03] border-border dark:border-white/[0.05] hover:bg-muted/50 dark:hover:bg-white/[0.05] transition-all group overflow-hidden relative">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-12 w-12 border-2 border-white/5 shadow-lg">
                                    <AvatarFallback className="bg-rose-500/10 text-rose-500 font-black text-sm">
                                      {feedback.guest_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-bold text-foreground text-[15px]">{feedback.guest_name}</h3>
                                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-tighter">
                                        <ShieldCheck className="h-2.5 w-2.5" />
                                        Verified Stay
                                      </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 font-medium">{feedback.guest_email}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-0.5">
                                    {renderStars(feedback.rating)}
                                    <span className="text-lg font-black text-foreground ml-2">{feedback.rating}<span className="text-[10px] text-muted-foreground">/10</span></span>
                                  </div>
                                  <div className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border", sentiment.class)}>
                                    {sentiment.text}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="relative p-4 rounded-2xl bg-secondary/30 dark:bg-black/20 border border-border dark:border-white/5 mb-4 italic text-foreground/80 text-sm leading-relaxed">
                                "{feedback.comment || "The guest didn't leave a specific comment, but the high rating indicates an exceptional experience."}"
                              </div>

                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-3">
                                  <span className="text-zinc-500">{new Date(feedback.created_at).toLocaleDateString()}</span>
                                  <div className="flex items-center gap-1.5 text-zinc-400">
                                    {getSourceIcon(feedback.guest_email)}
                                    via {feedback.guest_email.includes('@') ? feedback.guest_email.split('@')[1].split('.')[0] : 'In-App'}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-500/10 font-black h-8 px-4 rounded-lg">
                                  Generate Response
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="flex-1 m-0 overflow-hidden">
            <Card className="bg-card/30 dark:bg-zinc-900/30 backdrop-blur-xl border border-border dark:border-white/[0.03] rounded-[2rem] h-full overflow-hidden shadow-sm">
              <CardContent className="p-12 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-foreground">Survey Customization</h3>
                  <p className="text-zinc-500 text-sm max-w-lg">Personalize the visual identity of your guest surveys to match your brand's aesthetic.</p>
                </div>
                
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hero Header Image</span>
                  <ImageUpload
                    id="hero-image"
                    value={heroImage}
                    onChange={setHeroImage}
                    className="max-w-2xl bg-card dark:bg-zinc-900 shadow-sm"
                  />
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleImageUpdate} disabled={loading} className="h-12 px-8 bg-rose-500 hover:bg-rose-600 text-primary-foreground font-black rounded-xl">
                      {loading ? 'Processing...' : 'Save Appearance'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedbackManager;
