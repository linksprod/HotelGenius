
import React, { useState, useEffect, useMemo } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  CommandSeparator
} from '@/components/ui/command';
import { Search, X, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCommandSearchOptions } from './useCommandSearchOptions';
import { cn } from "@/lib/utils";

type SearchDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SearchDialog: React.FC<SearchDialogProps> = ({ open, setOpen }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { getFilteredResults } = useCommandSearchOptions();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen, open]);

  const handleClearSearch = () => setQuery('');

  const filteredResults = useMemo(() => getFilteredResults(query), [query, getFilteredResults]);

  // Group results by type
  const pageResults = filteredResults.filter(item => item.type === 'page');
  const spaResults = filteredResults.filter(item => item.type === 'spa-service');
  const restaurantResults = filteredResults.filter(item => item.type === 'restaurant');
  const shopResults = filteredResults.filter(item => item.type === 'shop');

  const handleSelect = (route: string) => {
    navigate(`/${slug}${route}`);
    setOpen(false);
    setQuery('');
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="overflow-hidden rounded-xl max-w-full w-[90vw] md:w-[600px]">
      <div className="px-3 pt-3">
        <div className="flex items-center border-b pb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 text-primary" />
          <CommandInput
            placeholder="What are you looking for?"
            value={query}
            onValueChange={setQuery}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="ml-2 rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <CommandList className="max-h-[65vh] overflow-y-auto py-2">
        <CommandEmpty>
          <div className="py-6 text-center flex flex-col items-center">
            <Search className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No results found for "{query}"</p>
          </div>
        </CommandEmpty>

        {pageResults.length > 0 && (
          <CommandGroup heading="Pages principales" className="px-2">
            {pageResults.map(item => (
              <CommandItem
                key={item.route}
                onSelect={() => handleSelect(item.route)}
                className="px-4 py-3 rounded-lg cursor-pointer flex justify-between items-center group hover:bg-primary/5"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {spaResults.length > 0 && (
          <>
            {pageResults.length > 0 && <CommandSeparator className="my-2" />}
            <CommandGroup heading="Spa & Bien-être" className="px-2">
              {spaResults.map(item => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.route}
                    onSelect={() => handleSelect(item.route)}
                    className="px-4 py-3 rounded-lg cursor-pointer flex justify-between items-center group hover:bg-primary/5"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center mr-3">
                        {Icon && <Icon className="h-4 w-4 text-green-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {restaurantResults.length > 0 && (
          <>
            {(pageResults.length > 0 || spaResults.length > 0) && <CommandSeparator className="my-2" />}
            <CommandGroup heading="Restaurants" className="px-2">
              {restaurantResults.map(item => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.route}
                    onSelect={() => handleSelect(item.route)}
                    className="px-4 py-3 rounded-lg cursor-pointer flex justify-between items-center group hover:bg-primary/5"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md bg-orange-100 flex items-center justify-center mr-3">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {shopResults.length > 0 && (
          <>
            {(pageResults.length > 0 || spaResults.length > 0 || restaurantResults.length > 0) && <CommandSeparator className="my-2" />}
            <CommandGroup heading="Shops" className="px-2">
              {shopResults.map(item => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.route}
                    onSelect={() => handleSelect(item.route)}
                    className="px-4 py-3 rounded-lg cursor-pointer flex justify-between items-center group hover:bg-primary/5"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md bg-yellow-100 flex items-center justify-center mr-3">
                        {Icon && <Icon className="h-4 w-4 text-yellow-700" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchDialog;
