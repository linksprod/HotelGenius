
import { NotificationProvider } from "./types.ts";

export class EmailProvider implements NotificationProvider {
    private supabaseClient: any;
    private resendApiKey: string;

    constructor(supabaseClient: any) {
        this.supabaseClient = supabaseClient;
        this.resendApiKey = Deno.env.get("RESEND_API_KEY") || "re_NrMvpxCz_CRj7a9LsYc9UWgmYFDF1VV64";
    }

    async send(params: any) {
        if (!this.resendApiKey) {
            console.warn("[EmailProvider] RESEND_API_KEY is not set. Falling back to mock.");
            console.log(`[MOCK EMAIL] To ${params.recipient_id}: ${params.title}`);
            return { success: true };
        }

        try {
            // Resolve recipient email address
            const { data: profile } = await this.supabaseClient
                .from('profiles')
                .select('email')
                .eq('id', params.recipient_id)
                .single();

            let recipientEmail = profile?.email;

            const refType = params.metadata?.reference_type;
            const refId = params.metadata?.reference_id;

            // Fallback 1: Check table_reservations (restaurant booking)
            if (!recipientEmail && refType === 'TableReservation' && refId) {
                console.log(`[EmailProvider] Email not in profiles, checking table_reservations for ref: ${refId}`);
                const { data: reservation } = await this.supabaseClient
                    .from('table_reservations')
                    .select('guest_email')
                    .eq('id', refId)
                    .single();

                if (reservation?.guest_email) {
                    recipientEmail = reservation.guest_email;
                    console.log(`[EmailProvider] Found email in table_reservations: ${recipientEmail}`);
                }
            }

            // Fallback 2: Check guests table
            if (!recipientEmail) {
                const { data: guest } = await this.supabaseClient
                    .from('guests')
                    .select('email')
                    .eq('id', params.recipient_id)
                    .single();

                if (guest?.email) {
                    recipientEmail = guest.email;
                    console.log(`[EmailProvider] Found email in guests table: ${recipientEmail}`);
                }
            }

            if (!recipientEmail) {
                console.error("[EmailProvider] Could not find email for recipient:", params.recipient_id);
                return { success: false, error: "Recipient email not found" };
            }

            const senderEmail = "Hotel Genius <onboarding@resend.dev>";
            const isCancellation = params.metadata?.source_event === 'cancelled';

            console.log(`[EmailProvider] Sending ${isCancellation ? 'cancellation' : 'standard'} email to: ${recipientEmail}`);

            const htmlBody = isCancellation
                ? this._buildCancellationHtml(params.title, params.body)
                : this._buildStandardHtml(params.title, params.body);

            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.resendApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: senderEmail,
                    to: recipientEmail,
                    subject: params.title,
                    html: htmlBody
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error("[EmailProvider] Resend API error:", errorData);
                return { success: false, error: `Resend HTTP ${response.status}: ${errorData}` };
            }

            const data = await response.json();
            console.log(`[EmailProvider] Successfully sent email to ${recipientEmail}, Resend ID: ${data.id}`);
            return { success: true };

        } catch (e: any) {
            console.error("[EmailProvider] Exception occurred:", e);
            return { success: false, error: e.message };
        }
    }

    /** Standard (confirmation / general) email — blue theme */
    private _buildStandardHtml(title: string, body: string): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <div style="background-color: #f8f9fa; padding: 20px; border-bottom: 2px solid #ebf0f5; text-align: center;">
                    <h2 style="color: #0f172a; margin: 0;">Hotel Genius</h2>
                </div>
                <div style="padding: 30px 20px;">
                    <h3 style="color: #3b82f6; margin-top: 0;">${title}</h3>
                    <p style="font-size: 16px;">${body.replace(/\n/g, '<br>')}</p>
                </div>
                <div style="background-color: #f8f9fa; padding: 15px 20px; text-align: center; color: #64748b; font-size: 13px;">
                    <p style="margin: 0;">This is an automated message from Hotel Genius. Please do not reply to this email.</p>
                </div>
            </div>
        `;
    }

    /** Cancellation email — red/warning theme to stand out visually */
    private _buildCancellationHtml(title: string, body: string): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <!-- Header -->
                <div style="background-color: #1e1e2e; padding: 24px 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">Hotel Genius</h2>
                </div>

                <!-- Red alert banner -->
                <div style="background-color: #ef4444; padding: 14px 20px; text-align: center;">
                    <p style="margin: 0; color: #ffffff; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;">
                        ❌ Reservation Cancelled
                    </p>
                </div>

                <!-- Body -->
                <div style="padding: 32px 28px; background-color: #ffffff;">
                    <h3 style="color: #dc2626; margin-top: 0; font-size: 20px;">${title}</h3>

                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
                        <p style="font-size: 15px; margin: 0; white-space: pre-line;">${body.replace(/\n/g, '<br>')}</p>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">
                        If you believe this is a mistake or you would like to make a new reservation, please don't hesitate to contact our team.
                    </p>

                    <div style="margin-top: 28px; text-align: center;">
                        <a href="mailto:contact@hotelgenius.com"
                           style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none;
                                  padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                            Contact Us
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0;">© Hotel Genius — This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
        `;
    }
}

export class SMSProvider implements NotificationProvider {
    private supabaseClient: any;

    constructor(supabaseClient?: any) {
        this.supabaseClient = supabaseClient;
    }

    async send(params: any) {
        try {
            // Resolve guest phone number from table_reservations using the reference_id
            let guestPhone: string | null = null;
            const refType = params.metadata?.reference_type;
            const refId = params.metadata?.reference_id;

            if (refType === 'TableReservation' && refId && this.supabaseClient) {
                const { data: reservation } = await this.supabaseClient
                    .from('table_reservations')
                    .select('guest_phone, guest_name')
                    .eq('id', refId)
                    .single();

                if (reservation?.guest_phone) {
                    guestPhone = reservation.guest_phone;
                }
            }

            if (!guestPhone) {
                // Fallback: check guests table
                if (this.supabaseClient) {
                    const { data: guest } = await this.supabaseClient
                        .from('guests')
                        .select('phone')
                        .eq('id', params.recipient_id)
                        .single();
                    guestPhone = guest?.phone || null;
                }
            }

            if (!guestPhone) {
                console.warn(`[SMSProvider] No phone number found for recipient: ${params.recipient_id}. SMS skipped.`);
                // Return success so it doesn't block email/push from being marked as sent
                return { success: true, skipped: true, reason: 'No phone number on file' };
            }

            // ─────────────────────────────────────────────────────────────────
            // MOCK: Structured log. Replace this block with real Twilio SDK call
            // when SMS credentials are configured.
            //
            // To integrate Twilio:
            //   const twilio = new Twilio(accountSid, authToken);
            //   await twilio.messages.create({ to: guestPhone, from: '+1234567890', body: params.body });
            // ─────────────────────────────────────────────────────────────────
            console.log(`[MOCK SMS] → ${guestPhone} : ${params.body}`);
            return { success: true };

        } catch (e: any) {
            console.error("[SMSProvider] Exception occurred:", e);
            return { success: false, error: e.message };
        }
    }
}

export class PushProvider implements NotificationProvider {
    async send(params: any) {
        // MOCK: Replace with real FCM / APNs call when push credentials are configured.
        console.log(`[MOCK PUSH] Sending via FCM to ${params.recipient_id}: ${params.title}`);
        return { success: true };
    }
}

export class WhatsAppProvider implements NotificationProvider {
    async send(params: any) {
        // MOCK: Replace with real Twilio WhatsApp when credentials are configured.
        console.log(`[MOCK WHATSAPP] Sending via Twilio WhatsApp to ${params.recipient_id}: ${params.body}`);
        return { success: true };
    }
}
