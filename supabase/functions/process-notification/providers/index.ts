
import { NotificationProvider } from "./types.ts";

export class EmailProvider implements NotificationProvider {
    async send(params: any) {
        console.log(`[MOCK EMAIL] Sending via SendGrid to ${params.recipient_id}: ${params.title}`);
        return { success: true };
    }
}

export class SMSProvider implements NotificationProvider {
    async send(params: any) {
        console.log(`[MOCK SMS] Sending via Twilio to ${params.recipient_id}: ${params.body}`);
        return { success: true };
    }
}

export class PushProvider implements NotificationProvider {
    async send(params: any) {
        console.log(`[MOCK PUSH] Sending via FCM to ${params.recipient_id}: ${params.title}`);
        return { success: true };
    }
}

export class WhatsAppProvider implements NotificationProvider {
    async send(params: any) {
        console.log(`[MOCK WHATSAPP] Sending via Twilio WhatsApp to ${params.recipient_id}: ${params.body}`);
        return { success: true };
    }
}
