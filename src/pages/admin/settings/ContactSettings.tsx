import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, MapPin, Save, Loader2, MessageSquare, User, Clock, CheckCircle2, Eye, Send, ChevronDown, ChevronUp, Inbox, Archive, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHotel } from '@/features/hotels/context/HotelContext';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { useToast } from '@/hooks/use-toast';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { cn } from '@/lib/utils';

interface ContactMessage {
    id: string;
    guest_name: string;
    guest_email: string;
    status: string;
    created_at: string;
    updated_at: string;
    subject?: string;
    content?: string;
    messages: Array<{
        id: string;
        sender_type: string;
        sender_name: string;
        content: string;
        created_at: string;
    }>;
}

const ContactSettings: React.FC = () => {
    const { hotel, refreshHotel } = useHotel();
    const { toast } = useToast();

    // Contact Info state
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');
    const [originalContactInfo, setOriginalContactInfo] = useState({ email: '', phone: '', address: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Contact Messages state
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [messageTab, setMessageTab] = useState('active');

    // Load contact info
    useEffect(() => {
        if (hotel?.id) {
            setIsLoading(true);
            supabase
                .from('hotels')
                .select('contact_email, contact_phone, address')
                .eq('id', hotel.id)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error fetching contact info:', error);
                    }
                    if (data) {
                        setContactEmail(data.contact_email || '');
                        setContactPhone(data.contact_phone || '');
                        setAddress(data.address || '');
                        setOriginalContactInfo({
                            email: data.contact_email || '',
                            phone: data.contact_phone || '',
                            address: data.address || ''
                        });
                    }
                    setIsLoading(false);
                });
        }
    }, [hotel?.id]);

    // Load contact messages
    const fetchContactMessages = useCallback(async () => {
        if (!hotel?.id) return;
        setIsLoadingMessages(true);
        try {
            // Fetch conversations that came from the contact form (current_handler = 'human', conversation_type = 'concierge')
            const { data: conversations, error: convError } = await supabase
                .from('conversations')
                .select('*')
                .eq('hotel_id', hotel.id)
                .eq('conversation_type', 'concierge')
                .eq('current_handler', 'human')
                .order('created_at', { ascending: false });

            if (convError) throw convError;

            // Fetch messages for each conversation
            const convIds = (conversations || []).map(c => c.id);
            let messagesData: any[] = [];
            if (convIds.length > 0) {
                const { data: msgs, error: msgError } = await supabase
                    .from('messages')
                    .select('*')
                    .in('conversation_id', convIds)
                    .order('created_at', { ascending: true });

                if (msgError) throw msgError;
                messagesData = msgs || [];
            }

            // Group messages by conversation
            const result: ContactMessage[] = (conversations || []).map(conv => {
                const convMessages = messagesData.filter(m => m.conversation_id === conv.id);
                const firstMsg = convMessages[0];

                // Extract subject from the first message content
                let subject = '';
                let content = firstMsg?.content || '';
                const subjectMatch = content.match(/\[Contact Form - Subject: (.*?)\]/);
                if (subjectMatch) {
                    subject = subjectMatch[1] === 'No Subject' ? '' : subjectMatch[1];
                    content = content.replace(/\[Contact Form - Subject: .*?\]\n\n/, '');
                }

                return {
                    id: conv.id,
                    guest_name: conv.guest_name,
                    guest_email: conv.guest_email || '',
                    status: conv.status,
                    created_at: conv.created_at,
                    updated_at: conv.updated_at,
                    subject,
                    content,
                    messages: convMessages.map(m => ({
                        id: m.id,
                        sender_type: m.sender_type,
                        sender_name: m.sender_name,
                        content: m.content,
                        created_at: m.created_at
                    }))
                };
            });

            setContactMessages(result);
        } catch (error) {
            console.error('Error fetching contact messages:', error);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [hotel?.id]);

    useEffect(() => {
        fetchContactMessages();
    }, [fetchContactMessages]);

    // Real-time subscription for new messages
    useEffect(() => {
        if (!hotel?.id) return;

        const channel = supabase
            .channel('contact-messages-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                fetchContactMessages();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                fetchContactMessages();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [hotel?.id, fetchContactMessages]);

    const handleSave = async () => {
        if (!hotel?.id) return;
        setIsSaving(true);
        try {
            const { error } = await supabaseAdmin
                .from('hotels')
                .update({
                    contact_email: contactEmail,
                    contact_phone: contactPhone,
                    address: address,
                })
                .eq('id', hotel.id);

            if (error) throw error;

            setOriginalContactInfo({
                email: contactEmail,
                phone: contactPhone,
                address: address
            });

            toast({ title: 'Success!', description: 'Contact settings updated successfully.' });
            refreshHotel();
        } catch (error: any) {
            console.error('Save contact error:', error);
            toast({ title: 'Error', description: error.message || 'Failed to save contact settings', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;
        setIsSendingReply(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: selectedMessage.id,
                    sender_type: 'staff',
                    sender_id: user?.id,
                    sender_name: 'Hotel Staff',
                    content: replyText.trim(),
                    message_type: 'text',
                    hotel_id: hotel?.id
                });

            if (error) throw error;

            toast({ title: 'Reply sent!', description: 'Your reply has been sent successfully.' });
            setReplyText('');
            fetchContactMessages();
        } catch (error: any) {
            console.error('Error sending reply:', error);
            toast({ title: 'Error', description: error.message || 'Failed to send reply', variant: 'destructive' });
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleMarkResolved = async (conversationId: string) => {
        try {
            const { error } = await supabase
                .from('conversations')
                .update({ status: 'completed' })
                .eq('id', conversationId);

            if (error) throw error;

            toast({ title: 'Success', description: 'Message marked as emailed.' });
            if (selectedMessage?.id === conversationId) {
                setSelectedMessage(null);
            }
            fetchContactMessages();
        } catch (error: any) {
            console.error('Error resolving conversation:', error);
            toast({ title: 'Error', description: error.message || 'Failed to update status', variant: 'destructive' });
        }
    };

    const handleReopen = async (conversationId: string) => {
        try {
            const { error } = await supabase
                .from('conversations')
                .update({ status: 'active' })
                .eq('id', conversationId);

            if (error) throw error;

            toast({ title: 'Success', description: 'Message marked as pending email.' });
            fetchContactMessages();
        } catch (error: any) {
            console.error('Error reopening conversation:', error);
            toast({ title: 'Error', description: error.message || 'Failed to update status', variant: 'destructive' });
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    };

    const activeMessages = contactMessages.filter(m => m.status === 'active' || m.status === 'escalated');
    const resolvedMessages = contactMessages.filter(m => m.status === 'completed');

    const filteredMessages = messageTab === 'active' ? activeMessages : resolvedMessages;

    if (!hotel) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                Loading hotel information...
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="mb-6">
                <AdminPageHeader
                    title="Contact Page Editor"
                    description="Manage custom contact phone, email, and address shown to guests"
                    icon={<Mail className="h-5 w-5 text-primary" />}
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                        <CardDescription>
                            Configure the details shown on the guest contact page. Empty fields will fall back to default values.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="contact-phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    Contact Phone
                                </Label>
                                <Input
                                    id="contact-phone"
                                    placeholder="+1 234 567 890"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Contact Email
                                </Label>
                                <Input
                                    id="contact-email"
                                    type="email"
                                    placeholder="info@yourhotel.com"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact-address" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Address
                            </Label>
                            <Textarea
                                id="contact-address"
                                placeholder={"123 Luxury Avenue\nParadise City, PC 12345\nUnited States"}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || (contactEmail === originalContactInfo.email && contactPhone === originalContactInfo.phone && address === originalContactInfo.address)}
                                className="w-full sm:w-auto"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Contact Messages Inbox */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Inbox className="h-5 w-5 text-primary" />
                                Contact Messages
                                {activeMessages.length > 0 && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                        {activeMessages.length} new
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                View and respond to messages sent through the contact form
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchContactMessages} disabled={isLoadingMessages}>
                            <RefreshCw className={cn("h-4 w-4", isLoadingMessages && "animate-spin")} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={messageTab} onValueChange={setMessageTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="active" className="gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Pending Email ({activeMessages.length})
                            </TabsTrigger>
                            <TabsTrigger value="resolved" className="gap-2">
                                <Archive className="h-4 w-4" />
                                Emailed ({resolvedMessages.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={messageTab} className="mt-0">
                            {isLoadingMessages ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : filteredMessages.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">
                                        {messageTab === 'active' ? 'No pending messages' : 'No emailed messages'}
                                    </p>
                                    <p className="text-xs mt-1">
                                        {messageTab === 'active'
                                            ? 'Messages from the contact form will appear here'
                                            : 'Messages marked as emailed will be archived here'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Messages List */}
                                    <ScrollArea className="max-h-[500px]">
                                        <div className="space-y-2 pr-2">
                                            {filteredMessages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                                                    className={cn(
                                                        "p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-sm",
                                                        selectedMessage?.id === msg.id
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-border bg-card"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                                <span className="font-medium text-sm truncate">{msg.guest_name}</span>
                                                                <Badge
                                                                    variant={msg.status === 'active' ? 'default' : msg.status === 'completed' ? 'secondary' : 'destructive'}
                                                                    className="text-[10px] px-1.5 py-0"
                                                                >
                                                                    {msg.status === 'active' ? 'New' : msg.status === 'completed' ? 'Emailed' : msg.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate">{msg.guest_email}</p>
                                                            {msg.subject && (
                                                                <p className="text-sm font-medium text-foreground mt-1 truncate">
                                                                    {msg.subject}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                {msg.content}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDate(msg.created_at)}
                                                            </span>
                                                            {msg.messages.length > 1 && (
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                    {msg.messages.length} msgs
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>

                                    {/* Message Detail */}
                                    <div className="border rounded-lg bg-muted/30">
                                        {selectedMessage ? (
                                            <div className="flex flex-col h-[500px]">
                                                {/* Header */}
                                                <div className="p-4 border-b bg-card rounded-t-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-sm">{selectedMessage.guest_name}</h4>
                                                            <p className="text-xs text-muted-foreground">{selectedMessage.guest_email}</p>
                                                            {selectedMessage.subject && (
                                                                <p className="text-sm font-medium mt-1">Subject: {selectedMessage.subject}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {selectedMessage.status === 'active' || selectedMessage.status === 'escalated' ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleMarkResolved(selectedMessage.id)}
                                                                    className="text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/95"
                                                                >
                                                                    <Mail className="h-3.5 w-3.5" />
                                                                    Mark as Emailed
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleReopen(selectedMessage.id)}
                                                                    className="text-xs gap-1"
                                                                >
                                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                                    Mark as Pending
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Messages */}
                                                <ScrollArea className="flex-1 p-4">
                                                    <div className="space-y-3">
                                                        {selectedMessage.messages.map((m) => {
                                                            // Clean up the content for display
                                                            let displayContent = m.content;
                                                            const subjectMatch = displayContent.match(/\[Contact Form - Subject: .*?\]\n\n/);
                                                            if (subjectMatch) {
                                                                displayContent = displayContent.replace(subjectMatch[0], '');
                                                            }

                                                            return (
                                                                <div
                                                                    key={m.id}
                                                                    className={cn(
                                                                        "p-3 rounded-lg max-w-[85%]",
                                                                        m.sender_type === 'guest'
                                                                            ? "bg-muted mr-auto"
                                                                            : "bg-primary/10 ml-auto"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-medium">
                                                                            {m.sender_type === 'guest' ? m.sender_name : '🏨 Hotel Staff'}
                                                                        </span>
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            {formatDate(m.created_at)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </ScrollArea>

                                                {/* Reply Input removed per user request */}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                                                <div className="text-center">
                                                    <Eye className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                                    <p className="text-sm font-medium">Select a message</p>
                                                    <p className="text-xs mt-1">Click on a message to view details and reply</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ContactSettings;
