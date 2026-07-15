import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function processHeroImages() {
  console.log("Fetching hotels and their hero images from hotel_about...");
  
  // Get all hotels first to map hotel_id to slug
  const { data: hotels } = await supabase.from('hotels').select('id, name, slug');
  const hotelMap = new Map();
  if (hotels) {
    hotels.forEach(h => hotelMap.set(h.id, h));
  }

  const { data: aboutRecords, error } = await supabase
    .from('hotel_about')
    .select('id, hotel_id, hero_image');

  if (error) {
    console.error("Error fetching hotel_about records:", error.message);
    return;
  }

  for (const record of aboutRecords) {
    const hotel = hotelMap.get(record.hotel_id);
    const hotelName = hotel ? hotel.name : "Unknown Hotel";
    const hotelSlug = hotel ? hotel.slug : `hotel-${record.hotel_id}`;

    if (record.hero_image && record.hero_image.startsWith('data:image')) {
      console.log(`Processing hero image for: ${hotelName} (${hotelSlug})`);
      
      try {
        // Extract base64 content
        const matches = record.hero_image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          console.warn("Invalid data URI format for hero image of", hotelName);
          continue;
        }

        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const extension = contentType.split('/')[1] || 'jpg';
        const filePath = `hotel-covers/${hotelSlug}-hero.${extension}`;

        console.log(`Uploading ${filePath} to 'avatars' bucket (type: ${contentType})...`);
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, buffer, {
            contentType: contentType,
            upsert: true
          });

        if (uploadError) {
          console.error(`Failed to upload hero image for ${hotelName}:`, uploadError.message);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        console.log(`Public URL generated: ${publicUrl}`);

        // Update hotel_about table
        const { error: updateError } = await supabase
          .from('hotel_about')
          .update({ hero_image: publicUrl })
          .eq('id', record.id);

        if (updateError) {
          console.error(`Failed to update hotel_about DB for ${hotelName}:`, updateError.message);
        } else {
          console.log(`Successfully updated hero_image in DB for ${hotelName}!`);
        }
      } catch (err) {
        console.error(`Error processing hero image for ${hotelName}:`, err.message);
      }
    } else {
      console.log(`Hotel ${hotelName} already has a non-base64 hero image or none.`);
    }
  }
}

processHeroImages();
