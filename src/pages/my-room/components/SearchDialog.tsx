
import React from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { filterItemsBySearch } from "./commandSearchUtils";
import { Room } from "@/hooks/useRoom";
import { RequestCategory, RequestItem } from "@/features/rooms/types";
import { Check, Search, X } from "lucide-react";

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  searchTerm: string;
  onSearchTermChange: (val: string) => void;
  isSubmitting: boolean;
  isLoading: boolean;
  categories: RequestCategory[];
  allItems: RequestItem[];
  itemsByCategory: Record<string, RequestItem[]>;
  securityCategory?: RequestCategory;
  onSelect: (item: RequestItem, category: RequestCategory) => void;
};

const SearchDialog: React.FC<Props> = ({
  open,
  setOpen,
  searchTerm,
  onSearchTermChange,
  isSubmitting,
  isLoading,
  categories,
  allItems,
  itemsByCategory,
  securityCategory,
  onSelect
}) => {
  const handleClearSearch = () => {
    onSearchTermChange('');
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="rounded-xl overflow-hidden"
    >
      <Command className="rounded-xl border shadow-xl">
        <div className="relative flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-5 w-5 shrink-0 text-primary" />
          <CommandInput
            placeholder="Search hotel services..."
            value={searchTerm}
            onValueChange={onSearchTermChange}
            disabled={isSubmitting || isLoading}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="ml-2 rounded-full p-1 hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <CommandList className="max-h-[65vh] overflow-y-auto">
          <CommandEmpty>
            <div className="py-6 text-center flex flex-col items-center">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
            </div>
          </CommandEmpty>
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading services...</p>
            </div>
          ) : (
            <>
              {/* Security Category (Special handling for urgency) */}
              {securityCategory && (
                <CommandGroup heading={securityCategory.name.toUpperCase()} className="px-3 py-2">
                  {filterItemsBySearch(
                    allItems.filter(item => item.category_id === securityCategory.id && item.is_active),
                    searchTerm
                  ).map(item => (
                    <CommandItem
                      key={item.id}
                      disabled={isSubmitting}
                      onSelect={() => onSelect(item, securityCategory)}
                      className="cursor-pointer flex items-center px-4 py-4 rounded-xl group hover:bg-rose-50/50 my-1 transition-all border border-transparent hover:border-rose-100"
                    >
                      <div className="flex flex-1 items-center">
                        <div className="mr-4 h-11 w-11 rounded-full bg-rose-100 flex items-center justify-center shrink-0 group-hover:bg-rose-200 transition-colors">
                          <span className="text-rose-600 font-bold text-lg">!</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 group-hover:text-rose-700 transition-colors">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-slate-500 mt-0.5 line-clamp-1 group-hover:text-rose-600/70 transition-colors">{item.description}</div>
                          )}
                        </div>
                      </div>
                      <Check className="h-5 w-5 text-rose-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Other Categories */}
              {Object.entries(itemsByCategory).map(([categoryId, items]) => {
                if (securityCategory && securityCategory.id === categoryId) return null;
                const category = categories.find(c => c.id === categoryId);
                if (!category) return null;

                const filtered = filterItemsBySearch(items, searchTerm);
                if (filtered.length === 0) return null;

                // Define icon colors based on category name
                const getCategoryStyles = (name: string) => {
                  const lowerName = name.toLowerCase();
                  if (lowerName.includes('housekeeping')) return { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-50/50', border: 'hover:border-emerald-100', iconBg: 'bg-emerald-100' };
                  if (lowerName.includes('maintenance')) return { bg: 'bg-amber-50', text: 'text-amber-600', hover: 'hover:bg-amber-50/50', border: 'hover:border-amber-100', iconBg: 'bg-amber-100' };
                  if (lowerName.includes('it') || lowerName.includes('technology')) return { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'hover:bg-indigo-50/50', border: 'hover:border-indigo-100', iconBg: 'bg-indigo-100' };
                  return { bg: 'bg-slate-50', text: 'text-slate-600', hover: 'hover:bg-slate-50/50', border: 'hover:border-slate-100', iconBg: 'bg-slate-100' };
                };

                const styles = getCategoryStyles(category.name);

                return (
                  <CommandGroup key={categoryId} heading={category.name.toUpperCase()} className="px-3 py-2">
                    {filtered.map(item => (
                      <CommandItem
                        key={item.id}
                        disabled={isSubmitting}
                        onSelect={() => onSelect(item, category)}
                        className={`cursor-pointer flex items-center px-4 py-4 rounded-xl group ${styles.hover} my-1 transition-all border border-transparent ${styles.border}`}
                      >
                        <div className="flex flex-1 items-center">
                          <div className={`mr-4 h-11 w-11 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0 group-hover:opacity-80 transition-opacity`}>
                            <span className={`${styles.text} font-bold text-base`}>
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
                            )}
                          </div>
                        </div>
                        <Check className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};

export default SearchDialog;
