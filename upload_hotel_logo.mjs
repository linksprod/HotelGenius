import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function processLogos() {
  console.log("Fetching hotels with base64 logos...");
  const { data: hotels, error } = await supabase
    .from('hotels')
    .select('id, name, slug, logo_url');

  if (error) {
    console.error("Error fetching hotels:", error.message);
    return;
  }

  for (const hotel of hotels) {
    if (hotel.logo_url && hotel.logo_url.startsWith('data:image')) {
      console.log(`Processing logo for hotel: ${hotel.name} (${hotel.slug})`);
      
      try {
        // Extract base64 content and content type
        const matches = hotel.logo_url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          console.warn("Invalid data URI format for", hotel.name);
          continue;
        }

        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const extension = contentType.split('/')[1] || 'png';
        const filePath = `hotel-logos/${hotel.slug}.${extension}`;

        console.log(`Uploading ${filePath} to 'avatars' bucket (type: ${contentType})...`);
        
        // Upload to Supabase Storage (overwrite if exists)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, buffer, {
            contentType: contentType,
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload logo for ${hotel.name}:`, uploadError.message);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        console.log(`Public URL generated: ${publicUrl}`);

        // Update hotels table
        const { error: updateError } = await supabase
          .from('hotels')
          .update({ logo_url: publicUrl })
          .eq('id', hotel.id);

        if (updateError) {
          console.error(`Failed to update DB for ${hotel.name}:`, updateError.message);
        } else {
          console.log(`Successfully updated logo in DB for ${hotel.name}!`);
        }
      } catch (err) {
        console.error(`Error processing logo for ${hotel.name}:`, err.message);
      }
    } else {
      console.log(`Hotel ${hotel.name} already has a non-base64 logo or no logo.`);
    }
  }
}

processLogos();
