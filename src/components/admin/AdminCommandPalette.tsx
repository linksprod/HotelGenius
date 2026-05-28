import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import {
  Search, LayoutDashboard, MessageCircle, Users, Trash2, Wrench,
  Shield, Wifi, Utensils, Sparkles, PartyPopper, Store, Settings,
  Bot, X, ArrowRight, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  path: string;
  group: string;
  keywords?: string[];
}

const ALL_COMMANDS: CommandItem[] = [
  { id: 'dashboard', label: 'Live Dashboard', description: 'Overview & stats', icon: LayoutDashboard, path: '/admin', group: 'Navigation', keywords: ['home', 'overview'] },
  { id: 'chat', label: 'Unified Inbox', description: 'Guest messages', icon: MessageCircle, path: '/admin/chat', group: 'Navigation', keywords: ['messages', 'chat'] },
  { id: 'guests', label: 'Guest Directory', description: 'All guests & profiles', icon: Users, path: '/admin/guests', group: 'Navigation', keywords: ['crm', 'guests'] },
  { id: 'housekeeping', label: 'Housekeeping', description: 'Room status & requests', icon: Trash2, path: '/admin/housekeeping', group: 'Operations', keywords: ['cleaning', 'rooms'] },
  { id: 'maintenance', label: 'Maintenance', description: 'Issue tracking', icon: Wrench, path: '/admin/maintenance', group: 'Operations', keywords: ['repairs', 'fix'] },
  { id: 'security', label: 'Security', description: 'Access & incidents', icon: Shield, path: '/admin/security', group: 'Operations', keywords: ['safety'] },
  { id: 'it', label: 'IT Support', description: 'Tech & network issues', icon: Wifi, path: '/admin/information-technology', group: 'Operations', keywords: ['wifi', 'tech'] },
  { id: 'restaurants', label: 'Dining', description: 'Restaurants & reservations', icon: Utensils, path: '/admin/restaurants', group: 'Revenue', keywords: ['food', 'dining', 'restaurant'] },
  { id: 'spa', label: 'Wellness & Spa', description: 'Treatments & bookings', icon: Sparkles, path: '/admin/spa', group: 'Revenue', keywords: ['spa', 'wellness', 'treatments'] },
  { id: 'events', label: 'Events', description: 'Events & promotions', icon: PartyPopper, path: '/admin/events', group: 'Revenue', keywords: ['events'] },
  { id: 'shops', label: 'Shops', description: 'Retail & products', icon: Store, path: '/admin/shops', group: 'Revenue', keywords: ['shop', 'store', 'retail'] },
  { id: 'ai', label: 'AI Concierge', description: 'Configure the AI agent', icon: Bot, path: '/admin/agent/concierge', group: 'AI', keywords: ['ai', 'bot', 'concierge'] },
  { id: 'settings', label: 'Settings', description: 'Hotel profile & modules', icon: Settings, path: '/admin/settings', group: 'Settings', keywords: ['config', 'setup', 'modules'] },
];

const RECENT_KEY = 'admin_cmd_recent';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AdminCommandPalette: React.FC<Props> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { resolvePath } = useHotelPath();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEY);
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global shortcut: Cmd+K or /
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!open) {
          // trigger open from parent
        }
      }
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const filtered = query.trim()
    ? ALL_COMMANDS.filter((cmd) => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some((k) => k.includes(q))
        );
      })
    : [];

  const recentItems = recent
    .map((id) => ALL_COMMANDS.find((c) => c.id === id))
    .filter(Boolean) as CommandItem[];

  const displayItems = query.trim() ? filtered : recentItems.length ? recentItems : ALL_COMMANDS.slice(0, 6);
  const groups = displayItems.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const g = query ? item.group : (recentItems.length && !query ? 'Recent' : item.group);
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const flatItems = Object.values(groups).flat();

  const executeItem = useCallback((item: CommandItem) => {
    const newRecent = [item.id, ...recent.filter((r) => r !== item.id)].slice(0, 5);
    setRecent(newRecent);
    localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
    navigate(resolvePath(item.path));
    onClose();
  }, [navigate, resolvePath, onClose, recent]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && flatItems[activeIndex]) executeItem(flatItems[activeIndex]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flatItems, activeIndex, executeItem]);

  useEffect(() => setActiveIndex(0), [query]);

  if (!open) return null;

  let globalIdx = 0;

  return (
    <div
      className="cmd-overlay fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="cmd-panel w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-border/50"
        style={{ background: 'rgba(var(--card), 0.98)', backdropFilter: 'blur(24px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, guests, settings..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] text-muted-foreground/60 bg-muted rounded px-1.5 py-0.5 border border-border/40">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto py-2">
          {flatItems.length === 0 && query ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No results for "<span className="text-foreground font-medium">{query}</span>"
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div className="px-4 py-1.5 flex items-center gap-2">
                  {group === 'Recent' && <Clock className="w-3 h-3 text-muted-foreground/60" />}
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {group}
                  </span>
                </div>
                {items.map((item) => {
                  const idx = globalIdx++;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isActive ? 'bg-primary/8 dark:bg-primary/10' : 'hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                        isActive ? 'bg-primary/15' : 'bg-muted'
                      )}>
                        <item.icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-foreground/80')}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                      {isActive && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border/60 flex items-center gap-4 text-[10px] text-muted-foreground/60">
          <span><kbd className="bg-muted rounded px-1 py-0.5 border border-border/40">↑↓</kbd> Navigate</span>
          <span><kbd className="bg-muted rounded px-1 py-0.5 border border-border/40">↵</kbd> Open</span>
          <span><kbd className="bg-muted rounded px-1 py-0.5 border border-border/40">ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
};

export default AdminCommandPalette;
