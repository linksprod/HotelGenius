import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { useToast } from '@/hooks/use-toast';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

const ContactSettings: React.FC = () => {
    const { hotel, refreshHotel } = useHotel();
    const { toast } = useToast();

    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');
    const [originalContactInfo, setOriginalContactInfo] = useState({ email: '', phone: '', address: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (hotel?.id) {
            setIsLoading(true);
            supabase
                .from('hotels')
                .select('contact_email, contact_phone, address')
                .eq('id', hotel.id)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error fetching contact info:', error);
                    }
                    if (data) {
                        setContactEmail(data.contact_email || '');
                        setContactPhone(data.contact_phone || '');
                        setAddress(data.address || '');
                        setOriginalContactInfo({
                            email: data.contact_email || '',
                            phone: data.contact_phone || '',
                            address: data.address || ''
                        });
                    }
                    setIsLoading(false);
                });
        }
    }, [hotel?.id]);

    const handleSave = async () => {
        if (!hotel?.id) return;
        setIsSaving(true);
        try {
            const { error } = await supabaseAdmin
                .from('hotels')
                .update({
                    contact_email: contactEmail,
                    contact_phone: contactPhone,
                    address: address,
                })
                .eq('id', hotel.id);

            if (error) throw error;

            setOriginalContactInfo({
                email: contactEmail,
                phone: contactPhone,
                address: address
            });

            toast({ title: 'Success!', description: 'Contact settings updated successfully.' });
            refreshHotel();
        } catch (error: any) {
            console.error('Save contact error:', error);
            toast({ title: 'Error', description: error.message || 'Failed to save contact settings', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!hotel) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                Loading hotel information...
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="mb-6">
                <AdminPageHeader
                    title="Contact Page Editor"
                    description="Manage custom contact phone, email, and address shown to guests"
                    icon={<Mail className="h-5 w-5 text-primary" />}
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                        <CardDescription>
                            Configure the details shown on the guest contact page. Empty fields will fall back to default values.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="contact-phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    Contact Phone
                                </Label>
                                <Input
                                    id="contact-phone"
                                    placeholder="+1 234 567 890"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Contact Email
                                </Label>
                                <Input
                                    id="contact-email"
                                    type="email"
                                    placeholder="info@yourhotel.com"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact-address" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Address
                            </Label>
                            <Textarea
                                id="contact-address"
                                placeholder="123 Luxury Avenue&#10;Paradise City, PC 12345&#10;United States"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || (contactEmail === originalContactInfo.email && contactPhone === originalContactInfo.phone && address === originalContactInfo.address)}
                                className="w-full sm:w-auto"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ContactSettings;
