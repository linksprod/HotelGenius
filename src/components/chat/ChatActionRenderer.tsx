import React from 'react';
import RestaurantBookingForm from '@/features/dining/components/RestaurantBookingForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, Info, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatActionRendererProps {
    type: string;
    metadata: any;
    onSuccess?: () => void;
}

export const ChatActionRenderer: React.FC<ChatActionRendererProps> = ({
    type,
    metadata,
    onSuccess
}) => {
    const [entities, setEntities] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(
        (type === 'booking_form' && metadata?.entity_type === 'restaurant') ||
        type === 'restaurant_list'
    );

    React.useEffect(() => {
        const fetchEntities = async () => {
            try {
                if (type === 'booking_form' && metadata?.entity_type === 'restaurant' && metadata?.entity_id) {
                    const { data, error } = await supabase
                        .from('restaurants')
                        .select('*')
                        .eq('id', metadata.entity_id)
                        .single();

                    if (error) throw error;
                    setEntities([data]);
                } else if (type === 'restaurant_list') {
                    const { data, error } = await supabase
                        .from('restaurants')
                        .select('*')
                        .limit(5);

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
    }, [type, metadata]);

    if (loading) {
        return (
            <Card className="p-4 flex items-center justify-center space-x-2 bg-muted/30 border-dashed">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Preparing...</span>
            </Card>
        );
    }

    // Action: Display a booking form
    if (type === 'booking_form') {
        const restaurant = entities[0];
        if (metadata?.entity_type === 'restaurant' && restaurant) {
            return (
                <Card className="p-4 border-primary/20 bg-primary/5 mt-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <Utensils className="h-5 w-5" />
                        <h4 className="font-semibold">Book a table at {restaurant.name}</h4>
                    </div>
                    <RestaurantBookingForm
                        restaurant={restaurant}
                        isChatMode={true}
                        onSuccess={() => {
                            if (onSuccess) onSuccess();
                        }}
                    />
                </Card>
            );
        }

        return (
            <Card className="p-4 bg-muted/20 border-dashed text-center">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">
                    {metadata?.entity_type?.toUpperCase()} booking form coming soon.
                </p>
            </Card>
        );
    }

    // Action: Reservation Pending Card
    if (type === 'reservation_pending') {
        return (
            <Card className="p-4 border-amber-500/20 bg-amber-500/5 mt-2 animate-in fade-in zoom-in-95">
                <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">Reservation Pending</h4>
                            <span className="text-[10px] bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-medium">Processing</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Your request has been sent to the hotel team.</p>

                        <div className="grid grid-cols-2 gap-2 p-2 bg-background/50 rounded-lg border border-border/50">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Restaurant</p>
                                <p className="text-xs font-medium">{metadata?.restaurantName || 'Restaurant'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Date & Time</p>
                                <p className="text-xs font-medium">{metadata?.date} • {metadata?.time}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Guests</p>
                                <p className="text-xs font-medium">{metadata?.guests} Person(s)</p>
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
                    Our Featured Dining
                </div>
                <div className="flex overflow-x-auto pb-2 gap-3 snap-x no-scrollbar">
                    {entities.map((r) => (
                        <Card key={r.id} className="min-w-[200px] flex-shrink-0 snap-center overflow-hidden border-border bg-card">
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
                                    View Menu / Book
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Action: Simple Confirmation
    if (type === 'confirmation') {
        return (
            <Card className="p-4 bg-green-500/10 border-green-500/20 mt-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <Info className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">Request Completed</h4>
                        <p className="text-xs text-muted-foreground">{metadata?.message || 'Your request has been processed successfully.'}</p>
                    </div>
                </div>
            </Card>
        );
    }

    // Action: General Message or fallback
    return null;
};
