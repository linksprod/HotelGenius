import React from 'react';
import RestaurantBookingForm from '@/features/dining/components/RestaurantBookingForm';
import EventReservationForm from '@/components/events/EventReservationForm';
import SpaBookingForm from '@/features/spa/components/SpaBookingForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRequestCategories, useRequestItems } from '@/hooks/useRequestCategories';
import { requestService } from '@/features/rooms/controllers/roomService';
import {
    Utensils, Info, Calendar, CheckCircle, Sparkles,
    Wrench, Trash2, Monitor, Shield, ChevronRight,
    Loader2, Check, Settings, MapPin, Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useTranslatedServices } from '@/i18n/translationHelpers';

interface ChatActionRendererProps {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any;
    hotelId?: string | null;
    onSuccess?: () => void;
    language?: 'en' | 'fr';
}

const ServiceRequestFlow: React.FC<{ initialCategory?: string, onSuccess?: () => void, language?: 'en' | 'fr' }> = ({ initialCategory, onSuccess, language }) => {
    const { t } = useTranslation();
    const { translateCategory, translateItemName } = useTranslatedServices(language);
    const [step, setStep] = React.useState<'categories' | 'items' | 'submitting' | 'confirmed'>(initialCategory ? 'items' : 'categories');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedCategory, setSelectedCategory] = React.useState<any>(null);
    const { categories, allItems, isLoading: loadingCats } = useRequestCategories();

    // Deduplicate categories by name
    const uniqueCategories = React.useMemo(() => {
        const map = new Map<string, any>();
        categories.forEach(cat => {
            const normalized = cat.name.toLowerCase().trim();
            if (!map.has(normalized)) {
                map.set(normalized, {
                    ...cat,
                    ids: [cat.id]
                });
            } else {
                const existing = map.get(normalized);
                existing.ids.push(cat.id);
            }
        });
        return Array.from(map.values());
    }, [categories]);

    // Filter items for the selected category locally, merging items from all duplicate categories
    const items = React.useMemo(() => {
        if (!selectedCategory) return [];
        const ids = selectedCategory.ids || [selectedCategory.id];
        return allItems.filter(item => ids.includes(item.category_id) && item.is_active !== false);
    }, [selectedCategory, allItems]);

    React.useEffect(() => {
        if (initialCategory && uniqueCategories.length > 0 && !selectedCategory) {
            const cat = uniqueCategories.find(c =>
                c.id === initialCategory ||
                c.ids?.includes(initialCategory) ||
                c.name.toLowerCase().includes(initialCategory.toLowerCase())
            );
            if (cat) {
                setSelectedCategory(cat);
                setStep('items');
            } else {
                setStep('categories');
            }
        }
    }, [initialCategory, uniqueCategories, selectedCategory]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleCategorySelect = (category: any) => {
        setSelectedCategory(category);
        setStep('items');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleItemSelect = async (item: any) => {
        setStep('submitting');
        try {
            await requestService(
                '', // Room ID will be handled by the controller
                'service',
                item.name,
                item.id,
                item.category_id // Use actual category ID from the item
            );
            setStep('confirmed');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error submitting service request:', error);
            setStep('categories');
            toast.error(t('chat.actionRenderer.submitFailed'));
        }
    };

    const getCategoryIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('housekeeping')) return <Trash2 className="h-5 w-5" />;
        if (lowerName.includes('maintenance')) return <Wrench className="h-5 w-5" />;
        if (lowerName.includes('it') || lowerName.includes('tech')) return <Monitor className="h-5 w-5" />;
        if (lowerName.includes('security')) return <Shield className="h-5 w-5" />;
        return <Settings className="h-5 w-5" />;
    };

    if (loadingCats) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (step === 'categories') {
        return (
            <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in slide-in-from-bottom-2">
                {uniqueCategories.map((cat) => (
                    <Card
                        key={cat.id}
                        className="p-4 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all border-border/50 bg-card group"
                        onClick={() => handleCategorySelect(cat)}
                    >
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                {getCategoryIcon(cat.name)}
                            </div>
                            <span className="text-xs font-semibold">{translateCategory(cat.name)}</span>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (step === 'items') {
        if (!selectedCategory) {
            return (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            );
        }

        return (
            <Card className="p-4 border-primary/20 bg-primary/5 mt-2 animate-in fade-in slide-in-from-right-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-primary">
                        {getCategoryIcon(selectedCategory.name)}
                        <h4 className="font-semibold text-sm">{translateCategory(selectedCategory.name)}</h4>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-6"
                        onClick={() => setStep('categories')}
                    >
                        {t('chat.actionRenderer.back')}
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    {items && items.length > 0 ? (
                        items.map((item) => (
                            <Button
                                key={item.id}
                                variant="outline"
                                className="justify-between text-xs h-9 bg-background/50 border-primary/10 hover:border-primary/30 hover:bg-primary/5 group"
                                onClick={() => handleItemSelect(item)}
                            >
                                {translateItemName(item.name)}
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        ))
                    ) : (
                        <p className="text-[10px] text-muted-foreground text-center py-2">{t('chat.actionRenderer.noItems')}</p>
                    )}
                </div>
            </Card>
        );
    }

    if (step === 'submitting') {
        return (
            <Card className="p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 border-dashed mt-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">{t('chat.actionRenderer.submitting')}</p>
            </Card>
        );
    }

    if (step === 'confirmed') {
        return (
            <Card className="p-4 bg-green-500/10 border-green-500/20 mt-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">{t('chat.actionRenderer.requestConfirmed')}</h4>
                        <p className="text-xs text-muted-foreground">{t('chat.actionRenderer.requestConfirmedDesc')}</p>
                    </div>
                </div>
            </Card>
        );
    }

    return null;
};

export const ChatActionRenderer: React.FC<ChatActionRendererProps> = ({
    type,
    metadata,
    hotelId,
    onSuccess,
    language
}) => {
    const { t } = useTranslation();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [entities, setEntities] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(
        (type === 'booking_form' && (metadata?.entity_type === 'restaurant' || metadata?.entity_type === 'event' || metadata?.entity_type === 'spa')) ||
        type === 'restaurant_list' ||
        type === 'event_list' ||
        type === 'activity_list' ||
        type === 'spa_list'
    );

    React.useEffect(() => {
        const fetchEntities = async () => {
            try {
                if (type === 'booking_form' && metadata?.entity_id) {
                    if (metadata?.entity_type === 'restaurant') {
                        const { data, error } = await supabase
                            .from('restaurants')
                            .select('*')
                            .eq('id', metadata.entity_id)
                            .single();

                        if (error) throw error;
                        setEntities([data]);
                    } else if (metadata?.entity_type === 'event') {
                        const { data, error } = await supabase
                            .from('events')
                            .select('*')
                            .eq('id', metadata.entity_id)
                            .single();

                        if (error) throw error;
                        setEntities([data]);
                    } else if (metadata?.entity_type === 'spa') {
                        const { data, error } = await supabase
                            .from('spa_services')
                            .select('*')
                            .eq('id', metadata.entity_id)
                            .single();

                        if (error) throw error;
                        setEntities([data]);
                    }
                } else if (type === 'restaurant_list') {
                    let query = supabase.from('restaurants').select('*');
                    if (hotelId) {
                        query = query.eq('hotel_id', hotelId);
                    }
                    const { data, error } = await query.limit(5);

                    if (error) throw error;
                    setEntities(data || []);
                } else if (type === 'event_list') {
                    let query = supabase.from('events').select('*').gte('date', new Date().toISOString().split('T')[0]);
                    if (hotelId) {
                        query = query.eq('hotel_id', hotelId);
                    }
                    const { data, error } = await query.limit(5);

                    if (error) throw error;
                    setEntities(data || []);
                } else if (type === 'activity_list') {
                    let query = supabase.from('hotel_activities').select('*');
                    if (hotelId) {
                        query = query.eq('hotel_id', hotelId);
                    }
                    const { data, error } = await query.limit(12);

                    if (error) throw error;
                    setEntities(data || []);
                } else if (type === 'spa_list') {
                    let query = supabase.from('spa_services').select('*').eq('status', 'available');
                    if (hotelId) {
                        query = query.eq('hotel_id', hotelId);
                    }
                    const { data, error } = await query.limit(5);

                    if (error) throw error;
                    setEntities(data || []);
                }
            } catch (err) {
                console.error('Error fetching entities for chat action:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEntities();
    }, [type, metadata, hotelId]);

    if (loading) {
        return (
            <Card className="p-4 flex items-center justify-center space-x-2 bg-muted/30 border-dashed">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">{t('chat.actionRenderer.preparing')}</span>
            </Card>
        );
    }

    // Action: Display a booking form
    if (type === 'booking_form') {
        const entity = entities[0];

        if (metadata?.entity_type === 'restaurant' && entity) {
            return (
                <Card className="p-4 border-primary/20 bg-primary/5 mt-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <Utensils className="h-5 w-5" />
                        <h4 className="font-semibold">{t('chat.actionRenderer.bookTable', { name: entity.name, lng: language })}</h4>
                    </div>
                    <RestaurantBookingForm
                        restaurant={entity}
                        isChatMode={true}
                        onSuccess={() => {
                            if (onSuccess) onSuccess();
                        }}
                        language={language}
                    />
                </Card>
            );
        }

        if (metadata?.entity_type === 'event' && entity) {
            return (
                <Card className="p-4 border-primary/20 bg-primary/5 mt-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <Calendar className="h-5 w-5" />
                        <h4 className="font-semibold">{t('chat.actionRenderer.bookSpot', { title: entity.title, lng: language })}</h4>
                    </div>
                    <EventReservationForm
                        eventId={entity.id}
                        eventDate={entity.date || new Date().toISOString()}
                        eventTitle={entity.title}
                        maxGuests={entity.capacity || 10}
                        isChatMode={true}
                        onSuccess={() => {
                            if (onSuccess) onSuccess();
                        }}
                        language={language}
                    />
                </Card>
            );
        }

        if (metadata?.entity_type === 'spa' && entity) {
            return (
                <Card className="p-4 border-primary/20 bg-primary/5 mt-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <Sparkles className="h-5 w-5" />
                        <h4 className="font-semibold">{t('chat.actionRenderer.bookTreatment', { name: entity.name, lng: language })}</h4>
                    </div>
                    <SpaBookingForm
                        service={entity}
                        isChatMode={true}
                        onSuccess={() => {
                            if (onSuccess) onSuccess();
                        }}
                        language={language}
                    />
                </Card>
            );
        }

        return (
            <Card className="p-4 bg-muted/20 border-dashed text-center">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">
                    {t('chat.actionRenderer.bookingFormComingSoon', { type: metadata?.entity_type?.toUpperCase(), lng: language })}
                </p>
            </Card>
        );
    }

    // Action: Reservation Pending Card
    if (type === 'reservation_pending') {
        const isEvent = metadata?.entityType === 'event';
        const isSpa = metadata?.entityType === 'spa';
        const entityLabel = isEvent ? 'Event' : isSpa ? 'Spa Service' : 'Restaurant';
        const entityName = metadata?.entityName || metadata?.restaurantName || entityLabel;

        return (
            <Card className="p-4 border-amber-500/20 bg-amber-500/5 mt-2 animate-in fade-in zoom-in-95">
                <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">{t('chat.actionRenderer.reservationPending')}</h4>
                            <span className="text-[10px] bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-medium">{t('chat.actionRenderer.processing')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{t('chat.actionRenderer.requestSent')}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-background/50 rounded-lg border border-border/50">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{entityLabel}</p>
                                <p className="text-xs font-medium">{entityName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{t('chat.actionRenderer.dateAndTime')}</p>
                                <p className="text-xs font-medium">{metadata?.date} • {metadata?.time}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{t('chat.actionRenderer.guests')}</p>
                                <p className="text-xs font-medium">{t('chat.actionRenderer.persons', { guests: metadata?.guests })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    // Action: Display restaurant list
    if (type === 'restaurant_list') {
        return (
            <div className="flex flex-col gap-3 mt-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                    <Utensils className="h-4 w-4" />
                    {t('chat.actionRenderer.featuredDining')}
                </div>
                <div className="flex overflow-x-auto pb-4 gap-4 snap-x no-scrollbar">
                    {entities.map((r) => (
                        <Card key={r.id} className="min-w-[240px] max-w-[85vw] flex-shrink-0 snap-center overflow-hidden border-border bg-card shadow-md">
                            {r.images?.[0] && (
                                <div className="h-24 w-full">
                                    <img src={r.images[0]} alt={r.name} className="h-full w-full object-cover" />
                                </div>
                            )}
                            <div className="p-3">
                                <h5 className="font-bold text-sm mb-1">{r.name}</h5>
                                <p className="text-[10px] text-muted-foreground mb-3 line-clamp-1">{r.cuisine} • {r.location}</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-[10px] h-7"
                                    onClick={() => {
                                        // This is a placeholder for triggering a form or navigation
                                        window.dispatchEvent(new CustomEvent('ai_trigger_form', { detail: { type: 'restaurant', id: r.id } }));
                                    }}
                                >
                                    {t('chat.actionRenderer.viewMenuBook')}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Action: Display event list
    if (type === 'event_list') {
        return (
            <div className="flex flex-col gap-3 mt-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                    <Calendar className="h-4 w-4" />
                    {t('chat.actionRenderer.upcomingEvents', 'Upcoming Events')}
                </div>
                <div className="flex overflow-x-auto pb-4 gap-4 snap-x no-scrollbar">
                    {entities.map((e) => (
                        <Card key={e.id} className="min-w-[240px] max-w-[85vw] flex-shrink-0 snap-center overflow-hidden border-border bg-card shadow-md">
                            {e.image && (
                                <div className="h-24 w-full">
                                    <img src={e.image} alt={e.title} className="h-full w-full object-cover" />
                                </div>
                            )}
                            <div className="p-3">
                                <h5 className="font-bold text-sm mb-1 line-clamp-1">{e.title}</h5>
                                <p className="text-[10px] text-muted-foreground mb-3 line-clamp-1">
                                    {new Date(e.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')} • {e.location || 'TBA'}
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-[10px] h-7"
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent('ai_trigger_form', { detail: { type: 'event', id: e.id } }));
                                    }}
                                >
                                    {t('chat.actionRenderer.bookEvent', 'Book Event')}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Action: Display daily activity list
    if (type === 'activity_list') {
        return (
            <div className="flex flex-col gap-3 mt-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    {t('chat.actionRenderer.dailyActivities', 'Today\'s Activities')}
                </div>
                <div className="flex overflow-x-auto pb-4 gap-4 snap-x no-scrollbar">
                    {entities.map((act) => (
                        <Card key={act.id} className="min-w-[200px] max-w-[80vw] flex-shrink-0 snap-center overflow-hidden border-border bg-card shadow-md flex flex-col">
                            {/* Colored top accent bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/40" />
                            <div className="p-3 flex flex-col flex-1 gap-2">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider w-max">
                                    Hotel Event
                                </span>
                                <h5 className="font-bold text-xs line-clamp-2 leading-tight min-h-[2rem]">{act.name}</h5>
                                <div className="border-t border-border/40 my-0.5" />
                                <div className="space-y-1 text-[10px] text-muted-foreground mt-auto">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                                        <span className="truncate">{act.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-primary shrink-0" />
                                        <span>{act.time}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Action: Display spa list
    if (type === 'spa_list') {
        return (
            <div className="flex flex-col gap-3 mt-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    {t('chat.actionRenderer.spaServices', 'Spa Services')}
                </div>
                <div className="flex overflow-x-auto pb-4 gap-4 snap-x no-scrollbar">
                    {entities.map((s) => (
                        <Card key={s.id} className="min-w-[240px] max-w-[85vw] flex-shrink-0 snap-center overflow-hidden border-border bg-card shadow-md">
                            {s.image && (
                                <div className="h-24 w-full">
                                    <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
                                </div>
                            )}
                            <div className="p-3">
                                <h5 className="font-bold text-sm mb-1 line-clamp-1">{s.name}</h5>
                                <p className="text-[10px] text-muted-foreground mb-3 line-clamp-1">
                                    {s.duration} min • {s.price} TND
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-[10px] h-7"
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent('ai_trigger_form', { detail: { type: 'spa', id: s.id } }));
                                    }}
                                >
                                    {t('chat.actionRenderer.bookTreatmentShort', 'Book Treatment')}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Action: Simple Confirmation
    if (type === 'confirmation' || type === 'confirmed') {
        return (
            <Card className="p-4 bg-green-500/10 border-green-500/20 mt-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <Info className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">{t('chat.actionRenderer.requestCompleted')}</h4>
                        <p className="text-xs text-muted-foreground">{metadata?.message || t('chat.actionRenderer.requestProcessedSuccess')}</p>
                    </div>
                </div>
            </Card>
        );
    }

    // Action: Service Request Flow
    if (type === 'service_request_flow') {
        return <ServiceRequestFlow initialCategory={metadata?.category} onSuccess={onSuccess} language={language} />;
    }

    // Action: General Message or fallback
    return null;
};
