
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { syncUserData } from '@/features/users/services/userService';
import { CompanionType } from '../components/CompanionsList';
import { CompanionData } from '@/features/users/types/userTypes';
import { registerUser } from '@/features/auth/services/authService';
import { supabase } from '@/integrations/supabase/client';
import { syncGuestData } from '@/features/users/services/guestService';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { useHotelPath } from '@/hooks/useHotelPath';

// Calculate the date 18 years ago for minimum age validation
const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

// Schema pour le formulaire d'inscription
export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  birthDate: z.date({ required_error: "Date of birth is required" })
    .refine((date) => date <= eighteenYearsAgo, {
      message: "You must be at least 18 years old",
    }),
  nationality: z.string().min(2, { message: "Nationality is required" }),
  roomNumber: z.string().optional().or(z.literal("")),
  checkInDate: z.date({ required_error: "Check-in date is required" })
    .refine((date) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return date >= now;
    }, {
      message: "Check-in date cannot be in the past",
    }),
  checkOutDate: z.date({ required_error: "Check-out date is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password confirmation is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

export type RegistrationFormValues = z.infer<typeof registerSchema>;

// Helper function to convert CompanionData
const mapCompanionsToCompanionData = (companions: CompanionType[]): CompanionData[] => {
  return companions.map(companion => ({
    first_name: companion.firstName,
    last_name: companion.lastName,
    relation: companion.relation,
    birthDate: companion.birthDate,
    firstName: companion.firstName,
    lastName: companion.lastName
  }));
};

export const useRegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hotelId } = useHotel();
  const { resolvePath } = useHotelPath();
  const [companions, setCompanions] = useState<CompanionType[]>([]);

  // Formulaire d'inscription
  const registerForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      nationality: "",
      roomNumber: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange"
  });

  const nextStep = async () => {
    let fields: (keyof RegistrationFormValues)[] = [];
    
    if (currentStep === 1) {
      fields = ["firstName", "lastName", "birthDate", "nationality"];
    } else if (currentStep === 2) {
      fields = ["checkInDate", "checkOutDate", "roomNumber"];
    }

    const isValid = await registerForm.trigger(fields);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleRegister = async (values: RegistrationFormValues) => {
    if (currentStep < 3) {
      await nextStep();
      return;
    }

    setLoading(true);
    try {
      // Logic for final step submission remains the same but handles null/empty roomNumber
      const userData = {
        first_name: values.firstName,
        last_name: values.lastName,
        birth_date: values.birthDate,
        nationality: values.nationality,
        room_number: values.roomNumber || null,
        check_in_date: values.checkInDate,
        check_out_date: values.checkOutDate,
        companions: mapCompanionsToCompanionData(companions),
      };

      const result = await registerUser(values.email, values.password, userData);

      if (!result.success) {
        throw new Error(result.error || "Registration failed");
      }

      if (result.userId) {
        await syncUserData({
          ...userData,
          email: values.email,
          id: result.userId
        });
      }

      toast({
        title: "Registration successful",
        description: "Welcome back!",
      });

      const { data: { session } } = await supabase.auth.getSession();
      const { data: isSuperAdmin } = session?.user?.id 
        ? await supabase.rpc('is_super_admin', { user_id: session.user.id })
        : { data: false };

      if (isSuperAdmin || values.email === 'projects@hotelgenius.app') {
        navigate('/administration/super/dashboard', { replace: true });
      } else {
        navigate(resolvePath('/'));
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    companions,
    setCompanions,
    registerForm,
    handleRegister,
    currentStep,
    nextStep,
    prevStep
  };
};
