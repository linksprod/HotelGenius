import React, { useState } from 'react';
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegistrationFormValues } from '../../hooks/useRegistrationForm';

// Complete list of world nationalities (alphabetical)
const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan",
  "Antiguan", "Argentine", "Armenian", "Australian", "Austrian", "Azerbaijani",
  "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian",
  "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Botswanan",
  "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese",
  "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean",
  "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran",
  "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech",
  "Danish", "Djiboutian", "Dominican", "Dutch", "East Timorese", "Ecuadorean",
  "Egyptian", "Emirati", "Equatorial Guinean", "Eritrean", "Estonian",
  "Ethiopian", "Fijian", "Finnish", "French", "Gabonese", "Gambian",
  "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan",
  "Guinean", "Guinea-Bissauan", "Guyanese", "Haitian", "Honduran", "Hungarian",
  "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli",
  "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakhstani",
  "Kenyan", "Kiribati", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese",
  "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger",
  "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian",
  "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian",
  "Moldovan", "Monacan", "Mongolian", "Montenegrin", "Moroccan", "Mozambican",
  "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian",
  "Nigerien", "North Korean", "Norwegian", "Omani", "Pakistani", "Palauan",
  "Palestinian", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian",
  "Philippine", "Polish", "Portuguese", "Qatari", "Romanian", "Russian",
  "Rwandan", "Saint Kitts and Nevis", "Saint Lucian", "Saint Vincentian",
  "Samoan", "San Marinese", "São Toméan", "Saudi Arabian", "Senegalese",
  "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovak",
  "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean",
  "South Sudanese", "Spanish", "Sri Lankan", "Sudanese", "Surinamese",
  "Swazi", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian",
  "Thai", "Togolese", "Tongan", "Trinidadian", "Tunisian", "Turkish",
  "Turkmen", "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbek",
  "Vanuatuan", "Venezuelan", "Vietnamese", "Yemeni", "Zambian", "Zimbabwean",
];

interface AdditionalFieldsProps {
  form: UseFormReturn<RegistrationFormValues>;
  step?: number;
}

const AdditionalFields: React.FC<AdditionalFieldsProps> = ({ form, step }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {(step === undefined || step === 1) && (
        <FormField
          control={form.control}
          name="nationality"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('auth.nationality', 'Nationality')}</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between font-normal h-10",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || t('auth.nationalityPlaceholder', 'Select your nationality')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                  <Command>
                    <CommandInput placeholder="Type to search..." className="h-9" />
                    <CommandList className="max-h-52">
                      <CommandEmpty>No nationality found.</CommandEmpty>
                      <CommandGroup>
                        {NATIONALITIES.map((nat) => (
                          <CommandItem
                            key={nat}
                            value={nat}
                            onSelect={(val) => {
                              // CommandItem lowercases the value, restore original casing
                              const original = NATIONALITIES.find(
                                (n) => n.toLowerCase() === val.toLowerCase()
                              ) || val;
                              field.onChange(original);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                field.value === nat ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {nat}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(step === undefined || step === 2) && (
        <FormField
          control={form.control}
          name="roomNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Room Number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(step === undefined || step === 3) && (
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default AdditionalFields;
