/**
 * Utility to translate French restaurant data to English.
 * Used when restaurant data is stored in French in the database.
 */

const FR_TO_EN_MEAL: Record<string, string> = {
  'Petit déjeuner': 'Breakfast',
  'Petit-déjeuner': 'Breakfast',
  'Petit Déjeuner': 'Breakfast',
  'Petit-Déjeuner': 'Breakfast',
  'petit déjeuner': 'Breakfast',
  'petit-déjeuner': 'Breakfast',
  'petit dejeuner': 'Breakfast',
  'petit-dejeuner': 'Breakfast',
  'Petit dejeuner': 'Breakfast',
  'Petit-dejeuner': 'Breakfast',
  'PETIT DEJEUNER': 'Breakfast',
  'PETIT DÉJEUNER': 'Breakfast',
  'Déjeuner': 'Lunch',
  'déjeuner': 'Lunch',
  'dejeuner': 'Lunch',
  'Dejeuner': 'Lunch',
  'Dîner': 'Dinner',
  'dîner': 'Dinner',
  'diner': 'Dinner',
  'Diner': 'Dinner',
  'Brunch': 'Brunch',
  'brunch': 'Brunch',
  'Douceurs du Palais Bayram': 'Palais Bayram Sweets',
  'Douceurs': 'Sweets',
  'douceurs': 'Sweets',
  'Ouvert': 'Open',
  'ouvert': 'Open',
  'Fermé': 'Closed',
  'fermé': 'Closed',
  'ferme': 'Closed',
  'Ferme': 'Closed',
  'Tous les jours': 'Every day',
  'tous les jours': 'Every day',
  'Du lundi au vendredi': 'Monday to Friday',
  'du lundi au vendredi': 'Monday to Friday',
  'Du lundi au dimanche': 'Monday to Sunday',
  'du lundi au dimanche': 'Monday to Sunday',
  'Lundi': 'Monday',
  'lundi': 'Monday',
  'Mardi': 'Tuesday',
  'mardi': 'Tuesday',
  'Mercredi': 'Wednesday',
  'mercredi': 'Wednesday',
  'Jeudi': 'Thursday',
  'jeudi': 'Thursday',
  'Vendredi': 'Friday',
  'vendredi': 'Friday',
  'Samedi': 'Saturday',
  'samedi': 'Saturday',
  'Dimanche': 'Sunday',
  'dimanche': 'Sunday',
  'et': 'and',
  'de': '',
  'le soir': 'in the evening',
  'midi': 'noon',
  'minuit': 'midnight',
  'Réservation obligatoire': 'Reservation required',
  'réservation obligatoire': 'Reservation required',
  'reservation obligatoire': 'Reservation required',
  'Sur réservation': 'By reservation',
  'sur réservation': 'By reservation',
  'sur reservation': 'By reservation',
  'Accès libre': 'Free access',
  'accès libre': 'Free access',
  'acces libre': 'Free access',
  'Payant': 'Paid entry',
  'payant': 'Paid entry',
};

/**
 * Convert French time format (e.g. "7h00", "19h30") to English format ("7:00 AM", "7:30 PM")
 */
function convertFrenchTime(text: string): string {
  // Match patterns like 7h00, 19h30, 7h, etc.
  return text.replace(/(\d{1,2})h(\d{2})?/g, (match, hours, minutes) => {
    const h = parseInt(hours, 10);
    const m = minutes ? `:${minutes}` : ':00';
    if (h === 0) return `12${m} AM`;
    if (h === 12) return `12${m} PM`;
    if (h > 12) return `${h - 12}${m} PM`;
    return `${h}${m} AM`;
  });
}

/**
 * Translate restaurant opening hours from French to English
 */
export function translateOpenHours(hours: string, language: string): string {
  if (!hours || language === 'fr') return hours;

  let translated = hours;

  // Replace French words/phrases — longest first to avoid partial matches
  const entries = Object.entries(FR_TO_EN_MEAL).sort((a, b) => b[0].length - a[0].length);
  for (const [fr, en] of entries) {
    const isShortWord = fr.toLowerCase() === 'et' || fr.toLowerCase() === 'de';
    const pattern = isShortWord 
      ? `\\b${fr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b` 
      : fr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    translated = translated.replace(new RegExp(pattern, 'g'), en);
  }

  // Convert French time format (7h00 → 7:00 AM)
  translated = convertFrenchTime(translated);

  // Clean up double spaces
  translated = translated.replace(/\s{2,}/g, ' ').trim();

  return translated;
}

/**
 * Translate a restaurant description from French to English.
 * Since descriptions are long text stored in the DB, we can only do word-by-word
 * substitution for known terms. Full translation requires DB-level multilingual support.
 */
export function translateDescription(description: string, language: string): string {
  if (!description || language === 'fr') return description;
  // For descriptions, we apply the same substitutions but descriptions will still
  // be mostly French unless the admin adds an English description in the DB.
  // Return as-is — proper fix requires DB multilingual fields.
  return description;
}
