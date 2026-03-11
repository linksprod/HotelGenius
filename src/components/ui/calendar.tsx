
import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());

  // Generate month names
  const months = React.useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const date = new Date(2000, i, 1);
      return date.toLocaleString('default', { month: 'long' });
    });
  }, []);

  // Generate a range of years from 50 years ago to 50 years in the future
  const years = React.useMemo(() => {
    const currentYearNum = new Date().getFullYear();
    return Array.from({ length: 101 }, (_, i) => currentYearNum - 50 + i);
  }, []);

  // Compute current displayed date
  const displayedDate = React.useMemo(() => {
    return new Date(currentYear, currentMonth, 1);
  }, [currentYear, currentMonth]);

  // Navigation handlers
  const goToPreviousMonth = React.useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = React.useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);

  const goToPreviousYear = React.useCallback(() => {
    setCurrentYear(prev => prev - 1);
  }, []);

  const goToNextYear = React.useCallback(() => {
    setCurrentYear(prev => prev + 1);
  }, []);

  // Custom header component
  function CustomCaption() {
    return (
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center">
          <button
            onClick={goToPreviousYear}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
            )}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Année précédente</span>
          </button>
          <button
            onClick={goToPreviousMonth}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Mois précédent</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Select
            value={currentMonth.toString()}
            onValueChange={(value) => setCurrentMonth(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[110px] text-sm font-medium">
              <SelectValue>{months[currentMonth]}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-60 overflow-y-auto">
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentYear.toString()}
            onValueChange={(value) => setCurrentYear(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[80px] text-sm font-medium">
              <SelectValue>{currentYear}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-60 overflow-y-auto">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <button
            onClick={goToNextMonth}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
            )}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Mois suivant</span>
          </button>
          <button
            onClick={goToNextYear}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
            )}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Année suivante</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <DayPicker
      month={displayedDate}
      onMonthChange={(month) => {
        setCurrentMonth(month.getMonth());
        setCurrentYear(month.getFullYear());
      }}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto bg-popover text-popover-foreground rounded-xl shadow-lg", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-2",
        caption: "flex justify-center relative items-center h-10 hidden",
        caption_label: "hidden",
        nav: "hidden",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
        row: "flex w-full mt-1",
        cell: "h-10 w-10 text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-medium rounded-full aria-selected:opacity-100 hover:bg-primary/15"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
        day_today: "border border-primary text-primary rounded-full",
        day_outside:
          "day-outside text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-full",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
