/**
 * ============================================================
 *  HotelGenius - Folder Watcher (Solution B)
 *  Surveille reservations.xlsx et lance l'import automatiquement
 *  dès que le fichier est modifié et enregistré.
 * ============================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import crypto from 'crypto';
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WATCH_FILE = path.join(__dirname, 'reservations.xlsx');

const SUPABASE_URL = "https://qvhthjtdzeerafabfbfc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aHRoanRkemVlcmFmYWJmYmZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDA1MTg1OCwiZXhwIjoyMDU1NjI3ODU4fQ.eXYVFo1S8Sp1mEd7cDSnzyTtnFFnPtrAdRvoEZvDt9M";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const DEFAULT_HOTEL_ID = "cf1a925e-296f-44a3-83da-11625b801d3b"; // Hotel genius

// ── Helpers ──────────────────────────────────────────────────
const COLORS = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m',
  red: '\x1b[31m', cyan: '\x1b[36m', bold: '\x1b[1m', dim: '\x1b[2m'
};
const log  = (msg) => console.log(`${COLORS.green}[✓]${COLORS.reset} ${msg}`);
const warn = (msg) => console.log(`${COLORS.yellow}[!]${COLORS.reset} ${msg}`);
const err  = (msg) => console.log(`${COLORS.red}[✗]${COLORS.reset} ${msg}`);
const info = (msg) => console.log(`${COLORS.cyan}[ℹ]${COLORS.reset} ${msg}`);

function now() {
  return new Date().toLocaleTimeString('fr-FR');
}

function formatDate(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Anti-double-trigger: Excel peut déclencher plusieurs events à la sauvegarde ──
let isRunning = false;
let debounceTimer = null;

// ── Import Logic (copie de import-reservations.mjs) ──────────
async function runImport() {
  if (isRunning) {
    warn(`Import déjà en cours, événement ignoré.`);
    return;
  }
  isRunning = true;

  console.log('\n' + '═'.repeat(55));
  console.log(`${COLORS.bold}  🔄  Modification détectée — ${now()}${COLORS.reset}`);
  console.log('═'.repeat(55));

  let data;
  try {
    // Attendre 1s pour laisser Excel finir d'écrire le fichier
    await new Promise(r => setTimeout(r, 1000));
    const workbook = XLSX.readFile(WATCH_FILE, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    data = XLSX.utils.sheet_to_json(sheet);
    info(`${data.length} ligne(s) lues dans reservations.xlsx`);
  } catch (e) {
    err(`Impossible de lire reservations.xlsx : ${e.message}`);
    isRunning = false;
    return;
  }

  let importedCount = 0;
  let updatedCount  = 0;
  let skippedCount  = 0;

  for (const row of data) {
    const firstName  = row['First Name']?.toString().trim();
    const lastName   = row['Last Name']?.toString().trim();
    const email      = row['Email']?.toString().trim().toLowerCase();
    const nationality   = row['Nationality']?.toString().trim();
    const birthDate     = formatDate(row['Date of birth']);
    const checkInDate   = formatDate(row['Check-in Date']);
    const checkOutDate  = formatDate(row['Check-out Date']);
    const hotelSlug     = (row['Hotel Slug'] || row['Hotel'])?.toString().trim().toLowerCase();
    const roomType      = row['Room Type']?.toString().trim() || 'Standard';

    if (!firstName || !lastName || !email || !checkInDate || !checkOutDate) {
      warn(`Ligne ignorée (champs manquants) : ${JSON.stringify(row)}`);
      continue;
    }

    // Résoudre l'hôtel
    let hotelId = DEFAULT_HOTEL_ID;
    if (hotelSlug) {
      const { data: hotels } = await supabase
        .from('hotels').select('id')
        .or(`slug.eq.${hotelSlug},name.ilike.%${hotelSlug}%`)
        .limit(1);
      if (hotels?.length > 0) hotelId = hotels[0].id;
      else warn(`Hôtel "${hotelSlug}" non trouvé → hôtel par défaut utilisé.`);
    }

    const token = crypto.randomBytes(8).toString('hex');

    const { data: existing } = await supabase
      .from('guests').select('id, user_id, checkin_status, email_sent_at')
      .eq('email', email).eq('hotel_id', hotelId);

    const guest = existing?.[0];

    if (guest) {
      if (guest.user_id || guest.checkin_status === 'completed') {
        info(`${email} a déjà fait son check-in → ignoré.`);
        skippedCount++;
        continue;
      }

      // Email already sent → update info ONLY, no token reset, no new email
      if (guest.email_sent_at) {
        info(`${email} a déjà reçu son email → mise à jour infos seulement.`);
        const { error: upErr } = await supabase.from('guests').update({
          first_name: firstName, last_name: lastName,
          birth_date: birthDate, nationality, check_in_date: checkInDate,
          check_out_date: checkOutDate, room_type: roomType
          // token & checkin_status non modifiés → pas de doublon d'email
        }).eq('id', guest.id);
        if (upErr) err(`Mise à jour échouée pour ${email} : ${upErr.message}`);
        else { log(`Info mis à jour (sans email) : ${email}`); updatedCount++; }
        continue;
      }

      // Email not yet sent → full update with new token so Edge Function will send it
      const { error: upErr } = await supabase.from('guests').update({
        first_name: firstName, last_name: lastName,
        birth_date: birthDate, nationality, check_in_date: checkInDate,
        check_out_date: checkOutDate, checkin_token: token,
        checkin_status: 'pending', room_type: roomType
      }).eq('id', guest.id);

      if (upErr) err(`Mise à jour échouée pour ${email} : ${upErr.message}`);
      else { log(`Mis à jour  : ${email}`); updatedCount++; }
    } else {
      const { error: inErr } = await supabase.from('guests').insert({
        first_name: firstName, last_name: lastName, email,
        birth_date: birthDate, nationality, check_in_date: checkInDate,
        check_out_date: checkOutDate, checkin_token: token,
        checkin_status: 'pending', hotel_id: hotelId,
        guest_type: 'Standard Guest', status: 'active', room_type: roomType
      });

      if (inErr) err(`Insertion échouée pour ${email} : ${inErr.message}`);
      else { log(`Importé     : ${email}`); importedCount++; }
    }
  }

  console.log('\n' + '─'.repeat(55));
  console.log(`${COLORS.bold}  📊  Résumé de l'import${COLORS.reset}`);
  console.log(`      Nouveaux guests   : ${COLORS.green}${importedCount}${COLORS.reset}`);
  console.log(`      Mis à jour        : ${COLORS.yellow}${updatedCount}${COLORS.reset}`);
  console.log(`      Ignorés (déjà OK) : ${COLORS.dim}${skippedCount}${COLORS.reset}`);
  console.log('─'.repeat(55));

  // Envoi des e-mails uniquement si nouveaux guests ou guests sans email envoyé
  if (importedCount > 0) {
    info(`Envoi des e-mails de check-in aux guests en attente...`);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-checkin-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ action: 'send_all' })
      });
      if (res.ok) {
        const result = await res.json();
        log(`E-mails envoyés avec succès ! (${result.sent ?? '?'} envoyé(s))`);
      } else {
        err(`Erreur Edge Function : ${await res.text()}`);
      }
    } catch (e) {
      err(`Impossible de contacter l'Edge Function : ${e.message}`);
    }
  } else {
    info(`Aucun nouveau guest → aucun e-mail envoyé.`);
  }

  console.log('\n' + '─'.repeat(55));
  log(`Import terminé. En attente de la prochaine modification...`);
  console.log('─'.repeat(55) + '\n');

  isRunning = false;
}

// ── Démarrage du watcher ──────────────────────────────────────
console.clear();
console.log('\n' + '═'.repeat(55));
console.log(`${COLORS.bold}${COLORS.cyan}  🏨  HotelGenius — Watcher automatique${COLORS.reset}`);
console.log('═'.repeat(55));
info(`Surveillance du fichier :`);
console.log(`    ${COLORS.bold}${WATCH_FILE}${COLORS.reset}`);
console.log();
info(`Modifiez et enregistrez reservations.xlsx depuis Excel.`);
info(`L'import et l'envoi des e-mails se déclencheront automatiquement.`);
console.log();
warn(`Pour arrêter le watcher, appuyez sur Ctrl+C dans cette fenêtre.`);
console.log('═'.repeat(55) + '\n');

// Vérifier que le fichier existe
if (!fs.existsSync(WATCH_FILE)) {
  err(`ERREUR : Le fichier reservations.xlsx est introuvable dans :`);
  err(`${__dirname}`);
  process.exit(1);
}

fs.watch(WATCH_FILE, (eventType) => {
  if (eventType === 'change') {
    // Debounce : attendre 2s que Excel finisse d'écrire
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runImport();
    }, 2000);
  }
});
