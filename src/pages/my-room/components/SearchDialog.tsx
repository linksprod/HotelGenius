
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { RequestCategory, RequestItem } from "@/features/rooms/types";
import { Check, Search, X } from "lucide-react";
import { useTranslatedServices } from "@/i18n/translationHelpers";

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

// ── Hook: tracks the real visible area accounting for the virtual keyboard ──
function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState<number>(
    () => window.visualViewport?.height ?? window.innerHeight
  );

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => setViewportHeight(vv.height);
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return viewportHeight;
}

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
  const { t } = useTranslation();
  const { translateCategory, translateItemName, translateItemDescription } = useTranslatedServices();
  const viewportHeight = useVisualViewport();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when dialog opens on mobile
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClearSearch = () => {
    onSearchTermChange("");
  };

  // Calculate available space for the results list.
  // On mobile with keyboard open, viewportHeight shrinks → list shrinks too.
  // Input bar ≈ 56px + dialog header/padding ≈ 24px → subtract 80px buffer.
  const listMaxHeight = Math.max(viewportHeight - 160, 120);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="rounded-xl overflow-hidden"
      // On mobile, push the dialog to the very top so results don't hide behind keyboard
      style={{ alignItems: "flex-start", paddingTop: "env(safe-area-inset-top, 8px)" }}
    >
      <Command className="rounded-xl border shadow-xl">
        {/* ── Search input bar ─────────────────────────────────── */}
        <div className="relative flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-5 w-5 shrink-0 text-primary" />
          <CommandInput
            ref={inputRef}
            placeholder={t("myRoom.request.searchPlaceholder", "Search hotel services...")}
            value={searchTerm}
            onValueChange={onSearchTermChange}
            disabled={isSubmitting || isLoading}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="ml-2 rounded-full p-1 hover:bg-gray-100"
              aria-label={t("myRoom.request.clearSearch", "Clear search")}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* ── Results list — height adapts to remaining visible space ── */}
        <CommandList
          style={{ maxHeight: listMaxHeight, overflowY: "auto" }}
        >
          {!isLoading && (
            <CommandEmpty>
              <div className="py-6 text-center flex flex-col items-center">
                <Search className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">
                  {t("myRoom.request.noResults", 'No results found for "{{term}}"', { term: searchTerm })}
                </p>
              </div>
            </CommandEmpty>
          )}

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("myRoom.request.loading", "Loading services...")}
              </p>
            </div>
          ) : (
            <>
              {/* Security Category (special urgency styling) */}
              {securityCategory && (
                <CommandGroup
                  heading={translateCategory(securityCategory.name).toUpperCase()}
                  className="px-3 py-2"
                >
                  {filterItemsBySearch(
                    allItems.filter(
                      (item) => item.category_id === securityCategory.id && item.is_active
                    ),
                    searchTerm
                  ).map((item) => (
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
                          <div className="font-semibold text-foreground group-hover:text-rose-600 transition-colors">
                            {translateItemName(item.name)}
                          </div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground mt-0.5 line-clamp-1 group-hover:text-rose-500 transition-colors">
                              {translateItemDescription(item.name, item.description)}
                            </div>
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
                const category = categories.find((c) => c.id === categoryId);
                if (!category) return null;

                const filtered = filterItemsBySearch(items, searchTerm);
                if (filtered.length === 0) return null;

                const getCategoryStyles = (name: string) => {
                  const lowerName = name.toLowerCase();
                  if (lowerName.includes("housekeeping"))
                    return { hover: "hover:bg-emerald-50/50", border: "hover:border-emerald-100", iconBg: "bg-emerald-100", text: "text-emerald-600" };
                  if (lowerName.includes("maintenance"))
                    return { hover: "hover:bg-amber-50/50", border: "hover:border-amber-100", iconBg: "bg-amber-100", text: "text-amber-600" };
                  if (lowerName.includes("it") || lowerName.includes("technology"))
                    return { hover: "hover:bg-indigo-50/50", border: "hover:border-indigo-100", iconBg: "bg-indigo-100", text: "text-indigo-600" };
                  return { hover: "hover:bg-slate-50/50", border: "hover:border-slate-100", iconBg: "bg-slate-100", text: "text-slate-600" };
                };

                const styles = getCategoryStyles(category.name);

                return (
                  <CommandGroup
                    key={categoryId}
                    heading={translateCategory(category.name).toUpperCase()}
                    className="px-3 py-2"
                  >
                    {filtered.map((item) => (
                      <CommandItem
                        key={item.id}
                        disabled={isSubmitting}
                        onSelect={() => onSelect(item, category)}
                        className={`cursor-pointer flex items-center px-4 py-4 rounded-xl group ${styles.hover} my-1 transition-all border border-transparent ${styles.border}`}
                      >
                        <div className="flex flex-1 items-center">
                          <div
                            className={`mr-4 h-11 w-11 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0 group-hover:opacity-80 transition-opacity`}
                          >
                            <span className={`${styles.text} font-bold text-base`}>
                              {translateCategory(category.name).charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                              {translateItemName(item.name)}
                            </div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                {translateItemDescription(item.name, item.description)}
                              </div>
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
  const { t } = useTranslation();
  const { translateCategory, translateItemName, translateItemDescription } = useTranslatedServices();
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
            placeholder={t('myRoom.request.searchPlaceholder', 'Search hotel services...')}
            value={searchTerm}
            onValueChange={onSearchTermChange}
            disabled={isSubmitting || isLoading}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="ml-2 rounded-full p-1 hover:bg-gray-100"
              aria-label={t('myRoom.request.clearSearch', 'Clear search')}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <CommandList className="max-h-[50vh] sm:max-h-[65vh] overflow-y-auto">
          {!isLoading && (
            <CommandEmpty>
              <div className="py-6 text-center flex flex-col items-center">
                <Search className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">{t('myRoom.request.noResults', 'No results found for "{{term}}"', { term: searchTerm })}</p>
              </div>
            </CommandEmpty>
          )}
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-sm text-muted-foreground">{t('myRoom.request.loading', 'Loading services...')}</p>
            </div>
          ) : (
            <>
              {/* Security Category (Special handling for urgency) */}
              {securityCategory && (
                <CommandGroup heading={translateCategory(securityCategory.name).toUpperCase()} className="px-3 py-2">
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
                          <div className="font-semibold text-foreground group-hover:text-rose-600 transition-colors">{translateItemName(item.name)}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground mt-0.5 line-clamp-1 group-hover:text-rose-500 transition-colors">{translateItemDescription(item.name, item.description)}</div>
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
                  <CommandGroup key={categoryId} heading={translateCategory(category.name).toUpperCase()} className="px-3 py-2">
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
                              {translateCategory(category.name).charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors">{translateItemName(item.name)}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{translateItemDescription(item.name, item.description)}</div>
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
