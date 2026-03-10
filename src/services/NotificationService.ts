
import { supabase } from '@/integrations/supabase/client';
import {
    Notification,
    CreateNotificationParams,
    NotificationStatus,
    NotificationType
} from '../types/notifications';
import { TemplateService } from './TemplateService';

const PROCESS_NOTIFICATION_FUNCTION = 'process-notification';

export class NotificationService {
    /**
     * Creates a new notification with idempotency check
     */
    static async createNotification(params: CreateNotificationParams): Promise<Notification | null> {
        try {
            // If idempotency_key is not provided, we should probably generate one 
            // based on the context to prevent duplicates if the caller retries.
            const idempotencyKey = params.idempotency_key || this.generateIdempotencyKey(params);

            const { data, error } = await supabase
                .from('notifications' as any)
                .insert({
                    hotel_id: params.hotel_id,
                    type: params.type,
                    channel: params.channel || 'in_app',
                    recipient_type: params.recipient_type,
                    recipient_id: params.recipient_id,
                    title: params.title || (params.template_data ? TemplateService.getTemplate(params.type, params.template_data).title : 'Notification'),
                    body: params.body || (params.template_data ? TemplateService.getTemplate(params.type, params.template_data).body : ''),
                    priority: params.priority || 'normal',
                    source_module: params.source_module,
                    source_event: params.source_event,
                    reference_id: params.reference_id,
                    reference_type: params.reference_type,
                    scheduled_at: params.scheduled_at,
                    created_by: params.created_by || 'system',
                    idempotency_key: idempotencyKey,
                    status: 'pending'
                } as any)
                .select()
                .single();

            if (error) {
                // Handle unique constraint violation for idempotency
                if (error.code === '23505') {
                    console.log('Duplicate notification ignored (idempotency)');
                    return null;
                }
                console.error('Error creating notification:', error);
                throw error;
            }

            return data as unknown as Notification;
        } catch (error) {
            console.error('NotificationService.createNotification failed:', error);
            return null;
        }
    }

    /**
     * Directly invokes the edge function to send a notification, bypassing database triggers.
     * Use this when database RLS or triggers are blocking the normal flow.
     */
    static async sendDirectNotification(
        params: CreateNotificationParams,
        channels: string[] = ['email']
    ): Promise<boolean> {
        try {
            console.log('[NotificationService] Invoking edge function directly for urgent delivery');

            const payload = {
                record: {
                    notification_id: `manual-${Date.now()}`,
                    hotel_id: params.hotel_id,
                    type: params.type,
                    recipient_id: params.recipient_id,
                    recipient_type: params.recipient_type,
                    title: params.title || (params.template_data ? TemplateService.getTemplate(params.type, params.template_data).title : 'Notification'),
                    body: params.body || (params.template_data ? TemplateService.getTemplate(params.type, params.template_data).body : ''),
                    priority: params.priority || 'normal',
                    reference_id: params.reference_id,
                    reference_type: params.reference_type,
                    source_module: params.source_module,
                    source_event: params.source_event
                },
                bypass_rpc: true,
                forced_channels: channels
            };

            const { data, error } = await supabase.functions.invoke(PROCESS_NOTIFICATION_FUNCTION, {
                body: payload
            });

            if (error) {
                console.error('[NotificationService] Direct edge function call failed:', error);
                return false;
            }

            console.log('[NotificationService] Direct edge function call successful:', data);
            return true;
        } catch (error) {
            console.error('[NotificationService] Exception in sendDirectNotification:', error);
            return false;
        }
    }

    /**
     * Updates the status of a notification
     */
    static async updateStatus(notificationId: string, status: NotificationStatus, errorMessage?: string): Promise<boolean> {
        const updateData: any = { status, updated_at: new Date().toISOString() };

        if (status === 'sent') updateData.sent_at = new Date().toISOString();
        if (status === 'delivered') updateData.delivered_at = new Date().toISOString();
        if (status === 'read') updateData.read_at = new Date().toISOString();
        if (errorMessage) updateData.error_message = errorMessage;

        const { error } = await supabase
            .from('notifications' as any)
            .update(updateData)
            .eq('notification_id', notificationId);

        if (error) {
            console.error('Error updating notification status:', error);
            return false;
        }
        return true;
    }

    /**
     * Marks a notification as read
     */
    static async markAsRead(notificationId: string): Promise<boolean> {
        return this.updateStatus(notificationId, 'read');
    }

    /**
     * Generates a simple idempotency key if none provided
     */
    private static generateIdempotencyKey(params: CreateNotificationParams): string {
        const parts = [
            params.type,
            params.recipient_id,
            params.reference_id || '',
            params.source_event || '',
            params.title
        ];
        // Simple deterministic string
        return parts.join(':');
    }
}
