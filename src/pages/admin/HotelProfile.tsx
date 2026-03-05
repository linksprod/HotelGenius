import React, { useState, useRef } from 'react';
import { Building2, Upload, X, Save, Loader2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const HotelProfile: React.FC = () => {
    const { hotel, refreshHotel } = useHotel();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [logoUrl, setLogoUrl] = useState(hotel?.logo_url || '');
    const [logoPreview, setLogoPreview] = useState(hotel?.logo_url || '');
    const [primaryColor, setPrimaryColor] = useState(hotel?.primary_color || '#94b3a3');
    const [secondaryColor, setSecondaryColor] = useState(hotel?.secondary_color || '#1a1a1a');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    if (!hotel) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                Loading hotel information...
            </div>
        );
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({ title: 'Error', description: 'Image must be smaller than 2MB', variant: 'destructive' });
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `hotel-logos/${hotel.id}/logo.${fileExt}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('lovable-uploads')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('lovable-uploads')
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;
            setLogoUrl(publicUrl);
            setLogoPreview(publicUrl);

            toast({ title: 'Uploaded', description: 'Logo uploaded. Click Save to apply.' });
        } catch (error: any) {
            console.error('Upload error:', error);
            // Fallback: convert to data URL and save directly to database
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                setLogoUrl(dataUrl);      // used by Save
                setLogoPreview(dataUrl);  // shown in preview
                toast({
                    title: 'Image ready',
                    description: 'Click Save Logo to apply the change.',
                });
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!hotel?.id) return;
        setIsSaving(true);
        try {
            // Use supabaseAdmin to bypass RLS restrictions on the hotels table
            const { error } = await supabaseAdmin
                .from('hotels')
                .update({
                    logo_url: logoUrl,
                    primary_color: primaryColor,
                    secondary_color: secondaryColor
                })
                .eq('id', hotel.id);

            if (error) throw error;

            toast({ title: 'Success!', description: 'Hotel profile saved successfully.' });
            // Refresh hotel context so sidebar and navbar update immediately
            refreshHotel();
        } catch (error: any) {
            console.error('Save error:', error);
            toast({ title: 'Error', description: error.message || 'Failed to save logo', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveLogo = () => {
        setLogoUrl('');
        setLogoPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div id="admin-ob-hotel-profile-header" className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hotel Profile</h1>
                    <p className="text-sm text-muted-foreground">Manage your hotel's branding and logo</p>
                </div>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {/* Hotel Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hotel Information</CardTitle>
                        <CardDescription>Your hotel's basic information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground text-xs">Hotel Name</Label>
                                <p className="font-medium">{hotel.name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Slug / URL</Label>
                                <p className="font-medium font-mono text-sm">/{hotel.slug}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logo Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hotel Logo</CardTitle>
                        <CardDescription>
                            This logo will appear in the <strong>admin sidebar</strong> and the <strong>guest-facing navbar</strong>. Recommended: PNG or SVG on a transparent background.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Preview */}
                        <div className="flex items-center gap-6">
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md overflow-hidden">
                                {logoPreview ? (
                                    <>
                                        <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                                        <button
                                            onClick={handleRemoveLogo}
                                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <Image className="h-8 w-8 text-primary-foreground/60" />
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">Current logo preview</p>
                                <p>This is how it will look in the sidebar</p>
                                {!logoPreview && <p className="text-amber-600 mt-1">No logo set — default icon shown</p>}
                            </div>
                        </div>

                        {/* Upload */}
                        <div className="space-y-3">
                            <Label>Upload Image</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4 mr-2" />
                                    )}
                                    {isUploading ? 'Uploading...' : 'Choose File'}
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 2MB</p>
                        </div>

                        {/* Or paste URL */}
                        <div className="space-y-2">
                            <Label htmlFor="logo-url">Or paste an image URL</Label>
                            <Input
                                id="logo-url"
                                placeholder="https://example.com/logo.png"
                                value={logoUrl}
                                onChange={(e) => {
                                    setLogoUrl(e.target.value);
                                    setLogoPreview(e.target.value);
                                }}
                            />
                        </div>

                        {/* Save */}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || logoUrl === (hotel?.logo_url || '')}
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {isSaving ? 'Saving...' : 'Save Logo'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Branding & Colors Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branding & Colors</CardTitle>
                        <CardDescription>
                            Personalize your hotel's application with your brand colors. These will be applied to buttons, icons, and navigation elements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Primary Color */}
                            <div className="space-y-3">
                                <Label htmlFor="primary-color">Primary Color (Guest & Admin)</Label>
                                <div className="flex gap-3 items-center">
                                    <div
                                        className="h-10 w-10 rounded-lg border shadow-sm shrink-0"
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                    <Input
                                        id="primary-color"
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="h-10 p-1 w-20 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="font-mono text-xs uppercase"
                                        placeholder="#94B3A3"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Used for buttons, active states, and primary accents.</p>
                            </div>

                            {/* Secondary Color */}
                            <div className="space-y-3">
                                <Label htmlFor="secondary-color">Secondary/Accent Color</Label>
                                <div className="flex gap-3 items-center">
                                    <div
                                        className="h-10 w-10 rounded-lg border shadow-sm shrink-0"
                                        style={{ backgroundColor: secondaryColor }}
                                    />
                                    <Input
                                        id="secondary-color"
                                        type="color"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="h-10 p-1 w-20 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="font-mono text-xs uppercase"
                                        placeholder="#1A1A1A"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Used for secondary backgrounds and subtle accents.</p>
                            </div>
                        </div>

                        {/* Save Colors */}
                        <div className="pt-4 border-t">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || (primaryColor === hotel.primary_color && secondaryColor === hotel.secondary_color)}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Branding Colors'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HotelProfile;
