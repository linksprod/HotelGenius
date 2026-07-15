import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "re_NrMvpxCz_CRj7a9LsYc9UWgmYFDF1VV64";

    let payload = {};
    try {
      payload = await req.json();
    } catch (_) {
      // Empty or non-JSON body
    }

    const { guest_id, action } = payload as any;

    let guestsToProcess: any[] = [];

    if (guest_id) {
      console.log(`Fetching specific guest: ${guest_id}`);
      const { data, error } = await supabaseClient
        .from("guests")
        .select("*, hotels(name, slug, logo_url, primary_color, secondary_color, address, contact_email, contact_phone, hotel_about(hero_image))")
        .eq("id", guest_id);
      if (error) throw error;
      guestsToProcess = data || [];
    } else if (action === "send_all") {
      console.log("Fetching all pending guests...");
      const { data, error } = await supabaseClient
        .from("guests")
        .select("*, hotels(name, slug, logo_url, primary_color, secondary_color, address, contact_email, contact_phone, hotel_about(hero_image))")
        .eq("checkin_status", "pending")
        .not("checkin_token", "is", null);
      if (error) throw error;
      guestsToProcess = data || [];
    } else {
      // Default: check-in date is in 2 days
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      const targetDateString = targetDate.toISOString().split("T")[0];
      
      console.log(`Fetching guests check-in on: ${targetDateString}`);
      const { data, error } = await supabaseClient
        .from("guests")
        .select("*, hotels(name, slug, logo_url, primary_color, secondary_color, address, contact_email, contact_phone, hotel_about(hero_image))")
        .eq("check_in_date", targetDateString)
        .eq("checkin_status", "pending")
        .not("checkin_token", "is", null);
      if (error) throw error;
      guestsToProcess = data || [];
    }

    console.log(`Processing ${guestsToProcess.length} guests for check-in emails.`);
    const results = [];

    for (const guest of guestsToProcess) {
      const hotelName = guest.hotels?.name || "Hotel Genius";
      const token = guest.checkin_token;
      const hotelSlug = guest.hotels?.slug || "hotel-genius";
      const primaryColor = guest.hotels?.primary_color || "#4F46E5";
      const secondaryColor = guest.hotels?.secondary_color || "#ab8a62";
      const logoUrl = guest.hotels?.logo_url;
      const hotelAddress = guest.hotels?.address || "";
      const hotelPhone = guest.hotels?.contact_phone || "";
      const hotelEmail = guest.hotels?.contact_email || "";
      
      // Get hero_image from hotel_about, fallback to default resort cover image if not found or empty
      const coverUrl = guest.hotels?.hotel_about?.[0]?.hero_image || 
                       "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&h=400&q=80";

      // Generate clean pre-filled registration link
      const platformUrl = Deno.env.get("PLATFORM_URL") || "http://localhost:5173";
      const checkinLink = `${platformUrl}/${hotelSlug}/guests/auth/login?token=${token}`;

      const subject = `Votre séjour à l'hôtel ${hotelName} approche — Préparez votre arrivée 🏨`;
      
      // Header branding: Gmail/Outlook block inline base64 images, so we fall back to stylized text if it's a data URI.
      const isBase64Logo = logoUrl && logoUrl.startsWith("data:image");
      const headerContent = (logoUrl && !isBase64Logo)
        ? `<img src="${logoUrl}" alt="${hotelName}" style="max-height: 40px; display: block;" />`
        : `<span style="color: ${primaryColor}; font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; letter-spacing: -0.02em;">${hotelName}</span>`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Navbar -->
          <div style="padding: 20px; border-bottom: 1px solid #f3f4f6; display: table; width: 100%; box-sizing: border-box;">
            <div style="display: table-cell; vertical-align: middle; text-align: left;">
              ${headerContent}
            </div>
            <div style="display: table-cell; vertical-align: middle; text-align: right;">
              <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Enregistrement en ligne</span>
            </div>
          </div>

          <!-- Cover Image -->
          <div style="padding: 20px 20px 0 20px;">
            <img src="${coverUrl}" alt="Bienvenue à l'hôtel" style="width: 100%; height: 180px; object-fit: cover; border-radius: 12px; display: block;" />
          </div>

          <!-- Main Content -->
          <div style="padding: 30px 20px;">
            <h2 style="color: ${primaryColor}; margin-top: 0; font-size: 22px; font-weight: bold;">Bonjour ${guest.first_name},</h2>
            <p style="color: #4b5563; line-height: 1.6; font-size: 15px; margin-top: 10px;">Nous sommes enchantés de votre prochaine visite à l'hôtel <strong>${hotelName}</strong>.</p>
            
            <!-- Stay Card -->
            <div style="background-color: #f9fafb; border-left: 4px solid ${primaryColor}; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 15px; font-weight: bold; margin-bottom: 15px;">Détails de votre séjour :</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #4b5563;">
                <tr style="height: 30px;">
                  <td style="font-weight: bold; width: 35%;">Type de chambre</td>
                  <td>${guest.room_type || "Chambre Standard"}</td>
                </tr>
                <tr style="height: 30px;">
                  <td style="font-weight: bold;">Dates de séjour</td>
                  <td>du ${guest.check_in_date} au ${guest.check_out_date}</td>
                </tr>
                <tr style="height: 30px;">
                  <td style="font-weight: bold;">Numéro de chambre</td>
                  <td><span style="background-color: #e5e7eb; color: #1f2937; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Attribué à l'arrivée</span></td>
                </tr>
              </table>
            </div>

            <p style="color: #4b5563; line-height: 1.6; font-size: 15px; margin-bottom: 30px;">Pour faciliter votre accueil et récupérer vos clés plus rapidement le jour J, nous vous invitons à compléter votre check-in en ligne dès aujourd'hui :</p>

            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${checkinLink}" style="background-color: ${primaryColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                Préparer mon Arrivée
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px; font-weight: bold;">${hotelName}</h4>
            
            <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 10px 0;">
              ${hotelAddress ? `📍 ${hotelAddress}<br />` : ''}
              ${hotelPhone ? `📞 Tel : ${hotelPhone}` : ''} ${hotelPhone && hotelEmail ? '&nbsp;|&nbsp;' : ''} ${hotelEmail ? `✉️ Email : ${hotelEmail}` : ''}
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 10px; margin-bottom: 0; line-height: 1.4;">
              Cet e-mail automatique vous est envoyé dans le cadre de votre réservation.<br />
              Sécurisé par <strong>Hotel Genius</strong>.
            </p>
          </div>
        </div>
      `;

      console.log(`Sending email to ${guest.email} with link: ${checkinLink}`);

      // Send email using Resend
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Hotel Genius <welcome@hotelgenius.world>",
          to: guest.email,
          subject: subject,
          html: htmlBody
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Resend API error for ${guest.email}:`, errorText);
        results.push({ email: guest.email, success: false, error: errorText });
      } else {
        const data = await response.json();
        console.log(`Email successfully sent to ${guest.email}, Resend ID: ${data.id}`);
        results.push({ email: guest.email, success: true, id: data.id });
      }
    }

    return new Response(
      JSON.stringify({ message: "Process completed", results }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
