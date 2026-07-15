import XLSX from 'xlsx';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DEFAULT_HOTEL_ID = "cf1a925e-296f-44a3-83da-11625b801d3b"; // Hotel genius

// Format date to YYYY-MM-DD
function formatDate(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function importReservations() {
  console.log("Reading reservations.xlsx...");
  let data;
  try {
    const workbook = XLSX.readFile('reservations.xlsx', { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    data = XLSX.utils.sheet_to_json(sheet);
  } catch (err) {
    console.error("Error reading reservations.xlsx:", err.message);
    process.exit(1);
  }

  console.log(`Found ${data.length} rows to process.`);
  let importedCount = 0;
  let updatedCount = 0;

  for (const row of data) {
    const firstName = row['First Name']?.toString().trim();
    const lastName = row['Last Name']?.toString().trim();
    const email = row['Email']?.toString().trim().toLowerCase();
    const nationality = row['Nationality']?.toString().trim();
    const birthDate = formatDate(row['Date of birth']);
    const checkInDate = formatDate(row['Check-in Date']);
    const checkOutDate = formatDate(row['Check-out Date']);
    const hotelSlugFromExcel = (row['Hotel Slug'] || row['Hotel'])?.toString().trim().toLowerCase();
    const roomType = row['Room Type']?.toString().trim() || "Standard";

    if (!firstName || !lastName || !email || !checkInDate || !checkOutDate) {
      console.warn("Skipping invalid row (missing required fields):", row);
      continue;
    }

    // Resolve Hotel ID dynamically
    let hotelId = DEFAULT_HOTEL_ID;
    if (hotelSlugFromExcel) {
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .select('id')
        .or(`slug.eq.${hotelSlugFromExcel},name.ilike.%${hotelSlugFromExcel}%`)
        .limit(1);

      if (hotelError) {
        console.error(`Error looking up hotel ${hotelSlugFromExcel}:`, hotelError.message);
      } else if (hotelData && hotelData.length > 0) {
        hotelId = hotelData[0].id;
      } else {
        console.warn(`Hotel "${hotelSlugFromExcel}" not found in database. Using default hotel.`);
      }
    }

    const token = crypto.randomBytes(8).toString('hex'); // 16 characters token

    // Check if guest already exists for this specific hotel
    const { data: existingGuests, error: searchError } = await supabase
      .from('guests')
      .select('id, user_id, checkin_status, email_sent_at')
      .eq('email', email)
      .eq('hotel_id', hotelId);

    if (searchError) {
      console.error(`Error searching guest ${email}:`, searchError.message);
      continue;
    }

    const existingGuest = existingGuests?.[0];

    if (existingGuest) {
      // If the guest has already completed check-in or created an account, do not overwrite
      if (existingGuest.user_id || existingGuest.checkin_status === 'completed') {
        console.log(`Guest ${email} has already completed check-in. Skipping.`);
        continue;
      }

      // If email was already sent, only update non-critical fields (no token reset, no new email)
      if (existingGuest.email_sent_at) {
        console.log(`Guest ${email} already received their email. Updating info only (no new email).`);
        const { error: updateError } = await supabase
          .from('guests')
          .update({
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
            nationality: nationality,
            check_in_date: checkInDate,
            check_out_date: checkOutDate,
            room_type: roomType
            // NOTE: token and checkin_status are NOT reset — no duplicate email will be triggered
          })
          .eq('id', existingGuest.id);
        if (updateError) console.error(`Failed to update guest ${email}:`, updateError.message);
        else { console.log(`Info updated (no email) : ${email}`); updatedCount++; }
        continue;
      }

      // Update existing record
      const updateData = {
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        nationality: nationality,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        checkin_token: token,
        checkin_status: 'pending',
        room_type: roomType
      };

      const { error: updateError } = await supabase
        .from('guests')
        .update(updateData)
        .eq('id', existingGuest.id);

      if (updateError) {
        console.error(`Failed to update guest ${email}:`, updateError.message);
      } else {
        console.log(`Updated guest ${email} for hotel ID: ${hotelId} (Token: ${token})`);
        updatedCount++;
      }
    } else {
      // Insert new record
      const insertData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        birth_date: birthDate,
        nationality: nationality,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        checkin_token: token,
        checkin_status: 'pending',
        hotel_id: hotelId,
        guest_type: 'Standard Guest',
        status: 'active',
        room_type: roomType
      };

      const { error: insertError } = await supabase
        .from('guests')
        .insert(insertData);

      if (insertError) {
        console.error(`Failed to insert guest ${email}:`, insertError.message);
      } else {
        console.log(`Imported guest ${email} (Token: ${token})`);
        importedCount++;
      }
    }
  }

  console.log(`\nImport summary:`);
  console.log(`- New guests imported: ${importedCount}`);
  console.log(`- Existing guests updated: ${updatedCount}`);

  // Trigger the Edge Function to send emails to all pending guests
  if (importedCount > 0 || updatedCount > 0) {
    console.log("\nTriggering Edge Function to send check-in emails to pending guests...");
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-checkin-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ action: 'send_all' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Edge Function executed successfully! Result:");
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.error("Failed to trigger Edge Function:", await response.text());
      }
    } catch (err) {
      console.error("Error triggering Edge Function:", err.message);
    }
  } else {
    console.log("\nNo new or pending guests to email.");
  }
}

importReservations();
