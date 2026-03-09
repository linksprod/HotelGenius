
import { NotificationType } from '../types/notifications';

interface Template {
    title: string;
    body: string;
}

export class TemplateService {
    private static templates: Record<string, Partial<Record<NotificationType, Template>>> = {
        en: {
            booking_confirmed: {
                title: "Booking Confirmed",
                body: "Hello {{guest_name}}, your booking at {{hotel_name}} is confirmed for {{date}}."
            },
            booking_cancelled: {
                title: "Booking Cancelled",
                body: "Your booking for {{date}} has been cancelled."
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
                title: "Réservation Confirmée",
                body: "Bonjour {{guest_name}}, votre réservation à {{hotel_name}} est confirmée pour le {{date}}."
            },
            booking_cancelled: {
                title: "Réservation Annulée",
                body: "Votre réservation pour le {{date}} a été annulée."
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
     * Simple interpolation for {{variable}} syntax
     */
    private static interpolate(text: string, data: Record<string, string>): string {
        return text.replace(/{{(\w+)}}/g, (match, key) => {
            return data[key] || match;
        });
    }
}
