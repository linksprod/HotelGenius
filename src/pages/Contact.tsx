
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneCall, Mail, MapPin, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { t } = useTranslation();
  const { hotel } = useHotel();
  const { toast } = useToast();

  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: ''
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hotel?.id) {
      supabase
        .from('hotels')
        .select('contact_email, contact_phone, address')
        .eq('id', hotel.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setContactInfo({
              phone: data.contact_phone || '',
              email: data.contact_email || '',
              address: data.address || ''
            });
          }
        });
    }
  }, [hotel?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({
        title: t('common.error'),
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user id (if logged in)
      const { data: { user } } = await supabase.auth.getUser();

      // Use SECURITY DEFINER RPC to bypass RLS on conversations/messages
      const { data, error } = await supabase.rpc('submit_contact_message', {
        p_guest_name: name,
        p_guest_email: email,
        p_subject: subject || null,
        p_message: message,
        p_hotel_id: hotel?.id || null,
        p_guest_id: user?.id || null
      });

      if (error) throw error;

      const response = data as { status: string; message?: string };
      if (response?.status === 'error') {
        throw new Error(response.message || 'Error submitting contact message');
      }

      toast({
        title: t('feedback.thankYou'),
        description: t('feedback.success')
      });

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error: any) {
      console.error("Error sending contact message:", error);
      toast({
        title: t('common.error'),
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayPhone = contactInfo.phone || t('contact.info.phoneNumber');
  const displayEmail = contactInfo.email || t('contact.info.primaryEmail');
  const displayAddress = contactInfo.address || t('contact.info.fullAddress');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pt-6 md:pt-8">
        <h1 className="text-3xl font-semibold text-secondary text-center mb-8">{t('contact.title')}</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 animate-in fade-in-50 duration-500">
            <h2 className="text-xl font-semibold mb-6">{t('contact.form.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input 
                  placeholder={t('contact.form.yourName')} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="bg-gray-50/50" 
                  required 
                />
              </div>
              <div>
                <Input 
                  type="email" 
                  placeholder={t('contact.form.yourEmail')} 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="bg-gray-50/50" 
                  required 
                />
              </div>
              <div>
                <Input 
                  placeholder={t('contact.form.subject')} 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  className="bg-gray-50/50" 
                />
              </div>
              <div>
                <Textarea 
                  placeholder={t('contact.form.yourMessage')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px] bg-gray-50/50"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  t('contact.form.sendMessage')
                )}
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="p-6 animate-in fade-in-50 duration-500 delay-100">
              <div className="flex items-start gap-4">
                <PhoneCall className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-2">{t('contact.info.phone')}</h3>
                  <p className="text-gray-600">{displayPhone}</p>
                  <p className="text-gray-600">{t('contact.info.available247')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 animate-in fade-in-50 duration-500 delay-200">
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-2">{t('contact.info.email')}</h3>
                  <p className="text-gray-600">{displayEmail}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 animate-in fade-in-50 duration-500 delay-300">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-2">{t('contact.info.address')}</h3>
                  <p className="text-gray-600">
                    {displayAddress.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < displayAddress.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
