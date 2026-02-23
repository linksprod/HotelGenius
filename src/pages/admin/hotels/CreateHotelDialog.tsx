import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


const createHotelSchema = z.object({
    hotelName: z.string().min(2, 'Hotel name is required'),
    hotelSlug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    adminFirstName: z.string().min(2, 'First name is required'),
    adminLastName: z.string().min(2, 'Last name is required'),
    adminEmail: z.string().email('Invalid email address'),
    adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type CreateHotelFormValues = z.infer<typeof createHotelSchema>;

interface CreateHotelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const CreateHotelDialog: React.FC<CreateHotelDialogProps> = ({
    open,
    onOpenChange,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CreateHotelFormValues>({
        resolver: zodResolver(createHotelSchema),
        defaultValues: {
            hotelName: '',
            hotelSlug: '',
            adminFirstName: '',
            adminLastName: '',
            adminEmail: '',
            adminPassword: '',
        },
    });

    const onSubmit = async (values: CreateHotelFormValues) => {
        setIsLoading(true);
        let newHotelId: string | null = null;

        try {
            // Step 1: Create the hotel record
            const { data: newHotel, error: hotelError } = await supabaseAdmin
                .from('hotels')
                .insert({
                    name: values.hotelName,
                    slug: values.hotelSlug,
                    address: 'Default Address',
                })
                .select()
                .single();

            if (hotelError) throw new Error(`Failed to create hotel: ${hotelError.message}`);
            newHotelId = newHotel.id;

            // Step 2: Create the admin user
            const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
                email: values.adminEmail,
                password: values.adminPassword,
                email_confirm: true,
                user_metadata: {
                    first_name: values.adminFirstName,
                    last_name: values.adminLastName,
                },
            });

            if (userError) {
                // Rollback hotel
                await supabaseAdmin.from('hotels').delete().eq('id', newHotelId);
                throw new Error(`Failed to create admin user: ${userError.message}`);
            }

            const userId = newUser.user.id;

            // Step 3: Assign hotel_admin role linked to the hotel
            const { error: roleError } = await supabaseAdmin
                .from('user_roles')
                .insert({
                    user_id: userId,
                    role: 'hotel_admin',
                    hotel_id: newHotelId,
                });

            if (roleError) {
                console.error('Role assignment failed:', roleError);
                throw new Error(`User created but role assignment failed: ${roleError.message}`);
            }

            // Step 4: Remove default 'user' role if auto-assigned by trigger
            await supabaseAdmin
                .from('user_roles')
                .delete()
                .eq('user_id', userId)
                .eq('role', 'user');

            // Step 5: Create guest profile for name display
            await supabaseAdmin.from('guests').insert({
                user_id: userId,
                first_name: values.adminFirstName,
                last_name: values.adminLastName,
                email: values.adminEmail,
                guest_type: 'Staff',
            });

            toast({
                title: 'Hotel Created ✓',
                description: `${values.hotelName} and its admin account have been created successfully.`,
            });

            form.reset();
            onOpenChange(false);
            onSuccess();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create hotel';
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Hotel</DialogTitle>
                    <DialogDescription>
                        Create a hotel instance and its primary admin account.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-4 border-b pb-4">
                            <h3 className="font-medium text-sm text-muted-foreground">Hotel Details</h3>
                            <FormField
                                control={form.control}
                                name="hotelName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hotel Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Grand Hotel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hotelSlug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL Slug (Subdomain)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="grand-hotel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium text-sm text-muted-foreground">Admin Account</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="adminFirstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="adminLastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="adminEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="admin@hotel.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="adminPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Hotel'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateHotelDialog;
