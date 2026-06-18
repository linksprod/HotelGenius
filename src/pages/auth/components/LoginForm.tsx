
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { loginUser } from '@/features/auth/services/authService';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useHotelPath } from '@/hooks/useHotelPath';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { isCustomDomain } from '@/utils/domain';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useTranslation } from 'react-i18next';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const { hotel } = useHotel();
  const onCustomDomain = isCustomDomain();
  const [loading, setLoading] = useState(false);
  const { setUserData } = useAuth();
  const { t } = useTranslation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      console.log('Login attempt with:', values.email);

      // Always pass hotel?.id — loginService will block any admin/staff not listed for this hotel
      const result = await loginUser(values.email, values.password, hotel?.id || null);

      if (result.success) {
        if (result.userData) {
          setUserData(result.userData);
        }
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.id) {
          const { data: isStaff } = await supabase.rpc('is_staff_member', { _user_id: session.user.id });
          const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_id: session.user.id });

          // ── GLOBAL RULE: admin/staff email → never the guest app ────────────
          // On custom domains: block entirely, force sign out
          if (onCustomDomain && (isStaff || isSuperAdmin)) {
            await supabase.auth.signOut();
            localStorage.clear();
            toast({
              variant: 'destructive',
              title: 'Access denied',
              description: 'Admin accounts must log in via the main platform. Guests need a separate account.',
            });
            setLoading(false);
            return;
          }

          // On standard platform: redirect to admin panel immediately
          if (isSuperAdmin || values.email === 'projects@hotelgenius.app') {
            navigate('/administration/super/dashboard', { replace: true });
            return;
          }

          if (isStaff) {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('hotels(slug)')
              .eq('user_id', session.user.id)
              .maybeSingle();
            const slug = roleData?.hotels?.slug;
            navigate(slug ? `/${slug}/admin` : resolvePath('/admin'), { replace: true });
            return;
          }
          // ────────────────────────────────────────────────────────────────────

          // Regular guest → find their hotel slug to redirect correctly
          const { data: guestData } = await supabase
            .from('guests')
            .select('hotel_id, hotels(slug)')
            .eq('user_id', session.user.id)
            .maybeSingle();

          // @ts-ignore
          const hotelSlug = guestData?.hotels?.slug;
          if (hotelSlug) {
            toast({ title: t('auth.welcomeToast', 'Welcome!'), description: t('auth.enjoyStayToast', 'Enjoy your stay.') });
            navigate(`/${hotelSlug}`, { replace: true });
          } else {
            const targetPath = resolvePath('/');
            if (targetPath !== '/') {
              toast({ title: t('auth.welcomeToast', 'Welcome!'), description: t('auth.enjoyStayToast', 'Enjoy your stay.') });
              navigate(targetPath, { replace: true });
            } else {
              // Show error: Guests must log in through their hotel's guest portal
              await supabase.auth.signOut();
              localStorage.clear();
              toast({
                variant: 'destructive',
                title: 'Login restricted',
                description: "Guests must log in using their hotel's guest link.",
              });
            }
          }
        }

      } else {
        console.error('Login failed:', result.error);
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: result.error || 'Please check your credentials and try again',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred during login',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.email', 'Email')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.emailPlaceholder', 'votre@email.com')} autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.password', 'Password')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t('auth.passwordPlaceholder', '••••••••')} autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.signingIn', 'Signing in...')}
            </>
          ) : (
            t('auth.signInBtn', 'Sign In')
          )}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
