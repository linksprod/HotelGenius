
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const [loading, setLoading] = useState(false);

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

      const result = await loginUser(values.email, values.password);

      if (result.success) {
        toast({
          title: 'Login successful',
          description: 'Welcome to Stay Genius',
        });

        // Check if user is admin and redirect accordingly
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: isStaff } = await supabase.rpc('is_staff_member', {
            _user_id: session.user.id
          });
          const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
            user_id: session.user.id
          });

          if (isStaff || isSuperAdmin) {
            navigate(resolvePath('/admin'));
          } else {
            navigate(resolvePath('/'));
          }
        } else {
          navigate(resolvePath('/'));
        }
      } else {
        console.error('Login failed:', result.error);
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: result.error || 'Please check your credentials and try again',
        });
      }
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="votre@email.com" autoComplete="email" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
