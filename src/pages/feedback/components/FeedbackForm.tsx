
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
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuthContext';

const FeedbackForm = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
        title: t('common.error'),
        description: t('forms.validation.pleaseProvideName'),
        variant: "destructive"
      });
      return;
    }

    if (!hotelId) {
      console.error('No hotel ID found for feedback submission');
      toast({
        title: t('common.error'),
        description: "Hotel identification is missing. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting feedback via RPC. Hotel ID:', hotelId, 'User ID:', user?.id);

      // Use RPC to bypass PostgREST schema cache issues with newly added columns
      const { data, error } = await supabase.rpc('submit_guest_feedback', {
        p_guest_name: name,
        p_guest_email: email,
        p_rating: rating,
        p_comment: comment,
        p_hotel_id: hotelId,
        p_guest_id: user?.id || null
      });

      if (error) {
        console.error('Supabase feedback RPC error:', error);
        throw error;
      }

      const response = data as { status: string; message?: string };
      if (response && response.status === 'error') {
        throw new Error(response.message || 'Error from server while submitting feedback');
      }

      toast({
        title: t('feedback.thankYou'),
        description: t('forms.messages.reservationSentDesc')
      });

      setName('');
      setEmail('');
      setComment('');
      setRating(0);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('forms.messages.reservationError'),
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
          <CardTitle className="text-2xl font-bold">{t('feedback.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t('forms.labels.name')} <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('forms.labels.namePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('forms.labels.email')} <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('forms.labels.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <StarRating rating={rating} setRating={setRating} />

            <div className="space-y-2">
              <Label htmlFor="comment">{t('feedback.comments')}</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('feedback.subtitle')}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('forms.buttons.processing') : t('feedback.submitFeedback')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackForm;
