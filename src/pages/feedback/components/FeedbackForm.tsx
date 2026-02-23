
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StarRating from './StarRating';
import { FeedbackType } from '../types/feedbackTypes';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

const FeedbackForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { hotelId } = useCurrentHotelId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !rating) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Utiliser le type FeedbackType pour l'insertion
      const { error } = await supabase.from('guest_feedback').insert({
        guest_name: name,
        guest_email: email,
        rating,
        comment
        // hotel_id is handled by DB trigger (if logged in) or needs other context
      });

      if (error) throw error;

      toast({
        title: "Merci pour votre avis !",
        description: "Votre feedback a été envoyé avec succès."
      });

      // Réinitialiser le formulaire
      setName('');
      setEmail('');
      setComment('');
      setRating(0);
    } catch (error) {
      console.error('Erreur lors de la soumission du feedback:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre feedback.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Partagez votre expérience</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  required
                />
              </div>
            </div>

            <StarRating rating={rating} setRating={setRating} />

            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec nous..."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon avis'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackForm;
