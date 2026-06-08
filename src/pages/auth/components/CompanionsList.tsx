
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CompanionType = {
  id?: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  relation: string;
  first_name?: string;
  last_name?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

interface CompanionsListProps {
  companions: CompanionType[];
  setCompanions: React.Dispatch<React.SetStateAction<CompanionType[]>>;
}

const relationOptions = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];

// Calculate reasonable range for birth dates (100 years ago to today)
const today = new Date();
const hundredYearsAgo = new Date();
hundredYearsAgo.setFullYear(today.getFullYear() - 100);

const CompanionsList: React.FC<CompanionsListProps> = ({ companions, setCompanions }) => {
  const addCompanion = () => {
    setCompanions([
      ...companions,
      { firstName: "", lastName: "", birthDate: new Date(), relation: "" }
    ]);
  };

  const removeCompanion = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateCompanion = (index: number, field: keyof CompanionType, value: any) => {
    const newCompanions = [...companions];
    newCompanions[index] = { ...newCompanions[index], [field]: value };
    setCompanions(newCompanions);
  };

  return (
    <div>
      {companions.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="font-medium">Companions</h3>
          
          {companions.map((companion, index) => (
            <div key={index} className="border p-4 rounded-md space-y-4 relative">
              <button 
                type="button"
                onClick={() => removeCompanion(index)}
                className="absolute top-2 right-2 h-6 w-6 p-0 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input 
                    value={companion.firstName} 
                    onChange={(e) => updateCompanion(index, 'firstName', e.target.value)}
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input 
                    value={companion.lastName} 
                    onChange={(e) => updateCompanion(index, 'lastName', e.target.value)}
                    placeholder="Last Name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal w-full",
                        )}
                      >
                        {companion.birthDate ? (
                          format(companion.birthDate, "P")
                        ) : (
                          <span>Select</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={companion.birthDate}
                        onSelect={(date) => updateCompanion(index, 'birthDate', date)}
                        disabled={(date) => date > today || date < hundredYearsAgo}
                        initialFocus
                        className="pointer-events-auto bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium">Relation</label>
                  <Select
                    value={companion.relation}
                    onValueChange={(value) => updateCompanion(index, 'relation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {relationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full mt-4"
        onClick={addCompanion}
      >
        Add a Companion
      </Button>
    </div>
  );
};

export default CompanionsList;
