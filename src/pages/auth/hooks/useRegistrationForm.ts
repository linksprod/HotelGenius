
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
  roomNumber: z.string().min(1, { message: "Room number is required" }),
  checkInDate: z.date({ required_error: "Check-in date is required" })
    .refine((date) => date >= new Date(), {
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

// Helper function to convert CompanionType to CompanionData
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
  });

  const handleRegister = async (values: RegistrationFormValues) => {
    setLoading(true);

    try {
      // Préparer les données utilisateur 
      const userData = {
        first_name: values.firstName,
        last_name: values.lastName,
        birth_date: values.birthDate,
        nationality: values.nationality,
        room_number: values.roomNumber,
        check_in_date: values.checkInDate,
        check_out_date: values.checkOutDate,
        companions: mapCompanionsToCompanionData(companions),
      };

      // Enregistrer l'utilisateur avec Supabase Auth
      const result = await registerUser(values.email, values.password, userData);

      if (!result.success) {
        throw new Error(result.error || "Registration failed");
      }

      // Si userId est défini, synchroniser avec Supabase
      if (result.userId) {
        // Créer directement l'entrée dans la table guests
        const guestData = {
          user_id: result.userId,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          room_number: values.roomNumber,
          nationality: values.nationality,
          birth_date: values.birthDate.toISOString().split('T')[0],
          check_in_date: values.checkInDate.toISOString().split('T')[0],
          check_out_date: values.checkOutDate.toISOString().split('T')[0],
          hotel_id: hotelId
        };

        // Créer l'invité directement dans la table guests
        const { error } = await supabase
          .from('guests')
          .insert([guestData]);

        if (error) {
          console.error('Error creating guest:', error);
          toast({
            variant: "destructive",
            title: "Error creating guest profile",
            description: "Your account was created but we couldn't save your guest profile.",
          });
        }

        // Synchroniser également avec la méthode existante pour la compatibilité
        const syncSuccess = await syncUserData({
          ...userData,
          email: values.email,
          id: result.userId
        });

        if (!syncSuccess) {
          toast({
            variant: "destructive",
            title: "Sync failed",
            description: "Data was saved locally but server sync failed.",
          });
        }
      }

      toast({
        title: "Registration successful",
        description: "Welcome to Stay Genius",
      });

      // Rediriger vers la page d'accueil
      navigate(resolvePath('/'));
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
    handleRegister
  };
};
