
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";

type SearchBarProps = {
  onOpen: () => void;
  className?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({ onOpen, className }) => {
  const { t } = useTranslation();
  return (
    <div className={cn("absolute -bottom-6 left-6 right-6", className)}>
    <div className="relative">
      <Input
        type="search"
        placeholder={t('search.placeholderLong', 'Search for services, activities, or amenities...')}
        className="w-full pl-12 pr-4 py-6 rounded-xl text-base bg-card border-border/50 shadow-xl border text-foreground placeholder:text-muted-foreground"
        onClick={onOpen}
        onFocus={onOpen}
        readOnly
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
    </div>
  </div>
  );
};

export default SearchBar;
