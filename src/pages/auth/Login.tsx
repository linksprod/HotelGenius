
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoginCard from './components/LoginCard';
import { useHotelPath } from '@/hooks/useHotelPath';

const Login = () => {
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if admin/staff to redirect correctly
        const { data: isStaff } = await supabase.rpc('is_staff_member', { _user_id: session.user.id });
        const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { user_id: session.user.id });

        if (isStaff || isSuperAdmin) {
          navigate(resolvePath('/admin'));
        } else {
          navigate(resolvePath('/'));
        }
      }

      // Vérifier aussi le localStorage pour notre méthode d'authentification simplifiée (guest)
      const userData = localStorage.getItem('user_data');
      if (userData && !session) {
        navigate(resolvePath('/'));
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-start justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 overflow-y-scroll relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10 opacity-30" />
      <LoginCard />
    </div>
  );
};

export default Login;
