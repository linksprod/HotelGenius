
import { NotificationType } from '../types/notifications';

interface Template {
    title: string;
    body: string;
}

export class TemplateService {
    private static templates: Record<string, Partial<Record<NotificationType, Template>>> = {
        en: {
            booking_confirmed: {
                title: "Booking Confirmed ✅",
                body: "Hello {{guest_name}}, your table reservation at {{restaurant_name}} is confirmed for {{date}} at {{time}} ({{guests}} guests). Looking forward to welcoming you!"
            },
            booking_cancelled: {
                title: "Reservation Cancelled ❌",
                body: "Hi {{guest_name}},\n\nWe're sorry to let you know that your table reservation at {{restaurant_name}} on {{date}} at {{time}} for {{guests}} guest(s) has been cancelled.\n\nIf you have any questions or would like to make a new reservation, please contact us.\n\nWe hope to see you soon!"
            },
            service_ticket_created: {
                title: "New Service Request",
                body: "Room {{room_number}}: {{description}}"
            },
            service_ticket_completed: {
                title: "Request Completed",
                body: "Your request '{{description}}' has been completed. We hope you are satisfied!"
            },
            room_ready: {
                title: "Room Ready",
                body: "Great news! Your room {{room_number}} is now ready for check-in."
            },
            table_reservation: {
                title: "Table Reservation",
                body: "New reservation for {{guests}} guests on {{date}} at {{time}} for {{guest_name}}."
            },
            spa_booking: {
                title: "Spa Booking",
                body: "New booking for {{service_name}} on {{date}} at {{time}} for {{guest_name}}."
            }
        },
        fr: {
            booking_confirmed: {
                title: "Réservation Confirmée ✅",
                body: "Bonjour {{guest_name}}, votre réservation à {{restaurant_name}} est confirmée pour le {{date}} à {{time}} ({{guests}} personnes). Nous avons hâte de vous accueillir !"
            },
            booking_cancelled: {
                title: "Réservation Annulée ❌",
                body: "Bonjour {{guest_name}},\n\nNous sommes désolés de vous informer que votre réservation de table au {{restaurant_name}} le {{date}} à {{time}} pour {{guests}} personne(s) a été annulée.\n\nSi vous avez des questions ou souhaitez effectuer une nouvelle réservation, n'hésitez pas à nous contacter.\n\nNous espérons vous voir bientôt !"
            },
            service_ticket_created: {
                title: "Nouvelle Demande de Service",
                body: "Chambre {{room_number}}: {{description}}"
            },
            service_ticket_completed: {
                title: "Demande Terminée",
                body: "Votre demande '{{description}}' a été complétée. Nous espérons que vous êtes satisfait !"
            },
            room_ready: {
                title: "Chambre Prête",
                body: "Bonne nouvelle ! Votre chambre {{room_number}} est maintenant prête."
            },
            table_reservation: {
                title: "Réservation de Table",
                body: "Nouvelle réservation pour {{guests}} personnes le {{date}} à {{time}} pour {{guest_name}}."
            },
            spa_booking: {
                title: "Réservation Spa",
                body: "Nouvelle réservation pour {{service_name}} le {{date}} à {{time}} pour {{guest_name}}."
            }
        }
    };

    /**
     * Short SMS templates — kept separate because 'booking_cancelled_sms' is not a NotificationType.
     * SMS messages must stay under ~160 characters.
     */
    private static smsTemplates: Record<string, Partial<Record<NotificationType, string>>> = {
        en: {
            booking_cancelled: "Hi {{guest_name}}, your table at {{restaurant_name}} on {{date}} at {{time}} has been cancelled. Please contact us to rebook."
        },
        fr: {
            booking_cancelled: "Bonjour {{guest_name}}, votre table au {{restaurant_name}} le {{date}} à {{time}} a été annulée. Contactez-nous pour une nouvelle réservation."
        }
    };

    /**
     * Gets a formatted template based on type, language, and data
     */
    static getTemplate(
        type: NotificationType,
        data: Record<string, string>,
        lang: string = 'en'
    ): Template {
        const langTemplates = this.templates[lang] || this.templates['en'];
        const template = langTemplates[type] || { title: type, body: JSON.stringify(data) };

        return {
            title: this.interpolate(template.title, data),
            body: this.interpolate(template.body, data)
        };
    }

    /**
     * Gets a short SMS body for the given notification type.
     * Returns null if no SMS-specific template exists (fall back to standard body).
     */
    static getSmsBody(
        type: NotificationType,
        data: Record<string, string>,
        lang: string = 'en'
    ): string | null {
        const langSms = this.smsTemplates[lang] || this.smsTemplates['en'];
        const template = langSms[type];
        if (!template) return null;
        return this.interpolate(template, data);
    }

    /**
     * Simple interpolation for {{variable}} syntax
     */
    private static interpolate(text: string, data: Record<string, string>): string {
        return text.replace(/{{\w+}}/g, (match) => {
            const key = match.slice(2, -2);
            return data[key] || match;
        });
    }
}
