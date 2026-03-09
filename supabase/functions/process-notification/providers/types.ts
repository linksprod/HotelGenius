
export interface NotificationProvider {
    send(params: {
        recipient_id: string;
        recipient_type: 'guest' | 'staff';
        title: string;
        body: string;
        metadata?: any;
    }): Promise<{ success: boolean; error?: string }>;
}
