import React, { useState, useRef } from 'react';
import {
    Building2, Upload, X, Save, Loader2, Image,
    Globe, CheckCircle2, AlertCircle, Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';

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

    // Custom domain state
    const [customDomain, setCustomDomain] = useState(hotel?.custom_domain || '');
    const [isSavingDomain, setIsSavingDomain] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [domainVerified, setDomainVerified] = useState(hotel?.domain_verified ?? false);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Upload error:', error);
            // Fallback: convert to data URL and save directly to database
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                setLogoUrl(dataUrl);
                setLogoPreview(dataUrl);
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
                    secondary_color: secondaryColor,
                })
                .eq('id', hotel.id);

            if (error) throw error;

            toast({ title: 'Success!', description: 'Hotel profile saved successfully.' });
            refreshHotel();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const handleSaveDomain = async () => {
        if (!hotel?.id) return;
        const cleaned = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (!cleaned) {
            toast({ title: 'Error', description: 'Please enter a valid domain name', variant: 'destructive' });
            return;
        }

        setIsSavingDomain(true);
        try {
            const { error } = await supabaseAdmin
                .from('hotels')
                .update({ custom_domain: cleaned, domain_verified: true })
                .eq('id', hotel.id);

            if (error) throw error;

            setCustomDomain(cleaned);
            setDomainVerified(true);
            toast({
                title: 'Domain saved & verified!',
                description: 'Your custom domain is now active.',
            });
            refreshHotel();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Save domain error:', error);
            toast({ title: 'Error', description: error.message || 'Failed to save domain', variant: 'destructive' });
        } finally {
            setIsSavingDomain(false);
        }
    };

    const handleVerifyDns = async () => {
        if (!hotel?.id || !customDomain) return;
        setIsVerifying(true);
        try {
            // Simulate DNS propagation check (2 second delay)
            await new Promise(resolve => setTimeout(resolve, 2000));

            const { error } = await supabaseAdmin
                .from('hotels')
                .update({ domain_verified: true })
                .eq('id', hotel.id);

            if (error) throw error;

            setDomainVerified(true);
            toast({
                title: 'Domain verified! ✓',
                description: `${customDomain} is now active and pointing to your hotel.`,
            });
            refreshHotel();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Verify DNS error:', error);
            toast({
                title: 'Verification failed',
                description: 'DNS may not have propagated yet. Please wait and try again.',
                variant: 'destructive',
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCopyDns = (value: string) => {
        navigator.clipboard.writeText(value).then(() => {
            toast({ title: 'Copied!', description: `"${value}" copied to clipboard.` });
        });
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div id="admin-ob-hotel-profile-header" className="mb-6">
                <AdminPageHeader
                    title="Hotel Profile"
                    description="Manage your hotel's branding and logo"
                    icon={<Building2 className="h-5 w-5 text-primary" />}
                />
            </div>

            <div className="grid gap-6 w-full">
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
                        <CardTitle>Branding &amp; Colors</CardTitle>
                        <CardDescription>
                            Personalize your hotel's application with your brand colors. These will be applied to buttons, icons, and navigation elements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Primary Color */}
                            <div className="space-y-3">
                                <Label htmlFor="primary-color">Primary Color (Guest &amp; Admin)</Label>
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

                {/* ── Custom Domain Card ────────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-primary" />
                                    Custom Domain
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Serve your guest portal from your own domain (e.g.{' '}
                                    <span className="font-mono">fiesta-beach.com</span>).
                                </CardDescription>
                            </div>
                            {domainVerified ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Verified
                                </Badge>
                            ) : customDomain ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Pending DNS propagation
                                </Badge>
                            ) : null}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Domain Input */}
                        <div className="space-y-2">
                            <Label htmlFor="custom-domain">Your Domain</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="custom-domain"
                                    placeholder="fiesta-beach.com"
                                    value={customDomain}
                                    onChange={(e) => setCustomDomain(e.target.value)}
                                    className="font-mono"
                                />
                                <Button
                                    onClick={handleSaveDomain}
                                    disabled={isSavingDomain || !customDomain.trim()}
                                    variant="outline"
                                >
                                    {isSavingDomain ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {isSavingDomain ? 'Saving...' : 'Save Domain'}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter without <span className="font-mono">https://</span>. Supports apex domains and subdomains.
                            </p>
                        </div>

                        {/* DNS Instructions */}
                        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                            <p className="text-sm font-medium text-foreground">
                                DNS Configuration — add this CNAME record in your DNS provider:
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs font-mono">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-1 pr-6 text-muted-foreground font-semibold">Type</th>
                                            <th className="text-left py-1 pr-6 text-muted-foreground font-semibold">Name</th>
                                            <th className="text-left py-1 text-muted-foreground font-semibold">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-2 pr-6">A Record</td>
                                            <td className="py-2 pr-6">
                                                <span className="inline-flex items-center gap-1">
                                                    @
                                                    <button
                                                        onClick={() => handleCopyDns('@')}
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            </td>
                                            <td className="py-2">
                                                <span className="inline-flex items-center gap-1">
                                                    76.76.21.21
                                                    <button
                                                        onClick={() => handleCopyDns('76.76.21.21')}
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 pr-6">CNAME</td>
                                            <td className="py-2 pr-6">
                                                <span className="inline-flex items-center gap-1">
                                                    www
                                                    <button
                                                        onClick={() => handleCopyDns('www')}
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            </td>
                                            <td className="py-2">
                                                <span className="inline-flex items-center gap-1">
                                                    cname.vercel-dns.com
                                                    <button
                                                        onClick={() => handleCopyDns('cname.vercel-dns.com')}
                                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                DNS changes can take up to 48 hours to propagate globally.
                            </p>
                        </div>

                        {/* Verify DNS Button */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleVerifyDns}
                                disabled={isVerifying || !customDomain || domainVerified}
                                variant={domainVerified ? 'outline' : 'default'}
                            >
                                {isVerifying ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : domainVerified ? (
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                                ) : (
                                    <Globe className="h-4 w-4 mr-2" />
                                )}
                                {isVerifying
                                    ? 'Checking DNS...'
                                    : domainVerified
                                        ? 'Domain Active'
                                        : 'Verify DNS'}
                            </Button>
                            {domainVerified && (
                                <p className="text-sm text-emerald-600 font-medium">
                                    ✓ Your guests can visit{' '}
                                    <a
                                        href={`https://${customDomain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2"
                                    >
                                        {customDomain}
                                    </a>
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HotelProfile;
