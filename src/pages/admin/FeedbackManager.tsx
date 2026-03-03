import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/hooks/use-toast';
import { Star, MessageSquare, Image } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHotelConfig } from '@/hooks/useHotelConfig';
import { supabase } from '@/integrations/supabase/client';
import { FeedbackType } from '@/pages/feedback/types/feedbackTypes';

import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

const FeedbackManager = () => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [heroImage, setHeroImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const { toast } = useToast();
  const { config, isLoading: configLoading, updateConfig } = useHotelConfig();
  const { hotelId, isSuperAdmin } = useCurrentHotelId();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoadingFeedback(true);
      try {
        let query: any = supabase
          .from('guest_feedback')
          .select('*');

        if (hotelId) {
          query = query.eq('hotel_id', hotelId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          const typedData = data as FeedbackType[];
          setFeedbacks(typedData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des feedbacks:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les avis clients.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingFeedback(false);
      }
    };

    fetchFeedbacks();
  }, [toast]);

  useEffect(() => {
    console.log("Admin config loaded:", config);
    if (config && config.feedback_hero_image) {
      console.log("Admin setting hero image to:", config.feedback_hero_image);
      setHeroImage(config.feedback_hero_image);
    } else {
      setHeroImage('https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
    }
  }, [config]);

  const handleImageUpdate = () => {
    setLoading(true);

    console.log("Updating hero image to:", heroImage);

    updateConfig({
      feedback_hero_image: heroImage
    });

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Image mise à jour",
        description: "L'image d'en-tête a été mise à jour avec succès.",
      });
    }, 1000);
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div id="admin-ob-feedback-header" className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Feedbacks</h1>
          <p className="text-sm text-muted-foreground">Gérez les avis et personnalisez la page de feedback</p>
        </div>
      </div>

      <Tabs defaultValue="reviews" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Avis clients</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span>Apparence</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avis récents</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFeedback ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : feedbacks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Aucun avis pour le moment.</p>
              ) : (
                <ScrollArea className="h-[450px] pr-4">
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <Card key={feedback.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{feedback.guest_name}</h3>
                            <p className="text-sm text-muted-foreground">{feedback.guest_email}</p>
                          </div>
                          <div className="flex items-center">
                            {renderStars(feedback.rating)}
                          </div>
                        </div>
                        <p className="text-sm mb-2">{feedback.comment}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(feedback.created_at)}
                          </span>
                          <Button variant="ghost" size="sm">
                            Répondre
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Image d'en-tête</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ImageUpload
                  id="hero-image"
                  value={heroImage}
                  onChange={setHeroImage}
                  className="max-w-2xl mx-auto"
                />
                <div className="flex justify-end">
                  <Button onClick={handleImageUpdate} disabled={loading}>
                    {loading ? 'Mise à jour...' : 'Mettre à jour l\'image'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackManager;
