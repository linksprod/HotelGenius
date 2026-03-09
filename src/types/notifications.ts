
export type NotificationType =
    | 'booking_confirmed'
    | 'booking_cancelled'
    | 'booking_reminder'
    | 'booking_no_show'
    | 'checkin_ready'
    | 'checkout_reminder'
    | 'checkout_overdue'
    | 'room_ready'
    | 'room_maintenance_started'
    | 'room_maintenance_completed'
    | 'service_ticket_created'
    | 'service_ticket_assigned'
    | 'service_ticket_completed'
    | 'service_ticket_escalated'
    | 'service_ticket_sla_breach'
    | 'message_received'
    | 'message_unread_5min'
    | 'message_unread_10min'
    | 'message_vip_received'
    | 'sla_warning_75'
    | 'sla_warning_90'
    | 'sla_breach'
    | 'guest_vip_arrived'
    | 'guest_complaint'
    | 'system_alert'
    | 'payment_confirmation'
    | 'health_form_pending'
    | 'service_request' // Legacy/General
    | 'table_reservation'
    | 'spa_booking'
    | 'message'
    | 'system'
    | 'event'
    | 'feedback';

export type NotificationChannel =
    | 'in_app'
    | 'email'
    | 'push'
    | 'sms'
    | 'whatsapp';

export type RecipientType =
    | 'guest'
    | 'staff'
    | 'manager'
    | 'system';

export type NotificationStatus =
    | 'pending'
    | 'sent'
    | 'delivered'
    | 'failed'
    | 'read'
    | 'cancelled';

export type NotificationPriority =
    | 'low'
    | 'normal'
    | 'high'
    | 'critical';

export interface Notification {
    notification_id: string;
    hotel_id?: string;
    type: NotificationType;
    channel: NotificationChannel;
    recipient_type: RecipientType;
    recipient_id: string;
    title: string;
    body: string;
    status: NotificationStatus;
    priority: NotificationPriority;
    source_module?: string;
    source_event?: string;
    reference_id?: string;
    reference_type?: string;
    scheduled_at?: string;
    sent_at?: string;
    delivered_at?: string;
    read_at?: string;
    retry_count: number;
    error_message?: string;
    idempotency_key: string;
    created_at: string;
    updated_at: string;
    created_by: string;
}

export interface CreateNotificationParams {
    hotel_id?: string;
    type: NotificationType;
    channel?: NotificationChannel;
    recipient_type: RecipientType;
    recipient_id: string;
    title?: string;
    body?: string;
    template_data?: Record<string, string>;
    priority?: NotificationPriority;
    source_module?: string;
    source_event?: string;
    reference_id?: string;
    reference_type?: string;
    scheduled_at?: string;
    created_by?: string;
    idempotency_key?: string;
}

export interface NotificationPreference {
    user_id: string; // auth.uid() or guest_id
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    whatsapp_enabled: boolean;
    dnd_enabled: boolean;
    dnd_start_time: string; // e.g. "22:00"
    dnd_end_time: string; // e.g. "08:00"
    language: string;
    booking_notifications: boolean;
    service_notifications: boolean;
    marketing_notifications: boolean;
    emergency_override: boolean;
    created_at: string;
    updated_at: string;
}
