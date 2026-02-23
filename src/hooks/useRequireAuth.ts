
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useHotelPath } from '@/hooks/useHotelPath';

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resolvePath } = useHotelPath();

  const requireAuth = (callback: () => void) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to make a booking.",
      });
      navigate(resolvePath('/auth/login'), { state: { from: window.location.pathname } });
      return;
    }
    callback();
  };

  return { requireAuth, isAuthenticated };
};
