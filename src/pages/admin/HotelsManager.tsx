import React, { useState, useEffect } from 'react';
import { Building2, Plus, RefreshCw, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { toast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import CreateHotelDialog from './hotels/CreateHotelDialog';

interface Hotel {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    address: string;
}

const HotelsManager: React.FC = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);

    const fetchHotels = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabaseAdmin
                .from('hotels')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHotels(data || []);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to load hotels',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const filteredHotels = hotels.filter((hotel) =>
        hotel.name.toLowerCase().includes(search.toLowerCase()) ||
        hotel.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Hotels Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage hotel instances and their admins
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchHotels}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create Hotel
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search hotels..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug / Subdomain</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredHotels.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No hotels found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredHotels.map((hotel) => (
                                <TableRow key={hotel.id}>
                                    <TableCell className="font-medium">{hotel.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{hotel.slug}</Badge>
                                    </TableCell>
                                    <TableCell>{hotel.address}</TableCell>
                                    <TableCell>
                                        {new Date(hotel.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <a
                                                href={`http://localhost:8080/h/${hotel.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                Visit
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateHotelDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={fetchHotels}
            />
        </div>
    );
};

export default HotelsManager;
