import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuthContext';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [hotelSlug, setHotelSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.id) {
        setRole(null);
        setHotelId(null);
        setHotelSlug(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            role, 
            hotel_id,
            hotels:hotel_id (
              slug
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          // Pick the highest-priority role
          const priority: string[] = ['super_admin', 'admin', 'moderator', 'hotel_admin', 'staff', 'user'];
          const roles = (data || []).map(r => r.role as string);
          const highest = priority.find(p => roles.includes(p)) || null;
          setRole(highest);

          // Get hotel_id and slug
          const roleWithHotel = data?.find(r => r.hotel_id);
          setHotelId(roleWithHotel?.hotel_id || null);

          // @ts-ignore - hotels is an object or array based on schema
          const slug = roleWithHotel?.hotels?.slug || null;
          setHotelSlug(slug);
        }
      } catch (error) {
        console.error('Error in role fetch:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user?.id]);

  return {
    role,
    hotelId,
    hotelSlug,
    loading,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'admin' || role === 'hotel_admin' || role === 'super_admin',
    isModerator: role === 'moderator'
  };
};
