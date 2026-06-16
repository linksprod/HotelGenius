
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from "react-hook-form";
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RegistrationFormValues } from '../../hooks/useRegistrationForm';
import { Button } from '@/components/ui/button';

interface PasswordFieldProps {
  form: UseFormReturn<RegistrationFormValues>;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ form }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('auth.password', 'Password')}</FormLabel>
            <div className="relative">
              <FormControl>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={t('auth.password', 'Password')}
                  {...field} 
                />
              </FormControl>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('auth.confirmPassword', 'Confirm Password')}</FormLabel>
            <div className="relative">
              <FormControl>
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder={t('auth.confirmPassword', 'Confirm Password')}
                  {...field} 
                />
              </FormControl>
              <Button
                type="button" 
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PasswordField;
