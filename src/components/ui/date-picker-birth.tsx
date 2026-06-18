
import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface BirthDatePickerProps {
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function BirthDatePicker({
  selected,
  onSelect,
  required,
  className,
  disabled = false,
  placeholder = "Select a date",
}: BirthDatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(selected);
  
  // Calculate reasonable date range for birth dates
  const today = new Date();
  
  // Calculate date for 18 years ago (minimum age requirement)
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
  
  // Calculate maximum date (100 years ago)
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(today.getFullYear() - 100);

  React.useEffect(() => {
    if (selected) {
      setDate(selected);
    }
  }, [selected]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onSelect) {
      onSelect(selectedDate);
    }
  };

  const formattedDate = date ? date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : placeholder;

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{formattedDate}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar 
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={(date) => date > eighteenYearsAgo || date < hundredYearsAgo}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
