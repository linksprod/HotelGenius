
/**
 * Valide si un ID d'invité est au format UUID valide
 */
export const validateGuestId = (userId: string | null | undefined): boolean => {
  if (!userId) {
    console.error('Guest ID is null or undefined');
    return false;
  }
  
  // Vérifier si l'ID est au format UUID valide
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValid = uuidRegex.test(userId);
  
  if (!isValid) {
    console.error(`Invalid guest ID format: ${userId}`);
  }
  
  return isValid;
};

/**
 * Enregistre une opération sur un invité dans les logs
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logGuestOperation = (operation: string, userId: string, success: boolean, details?: any): void => {
  const logMessage = success 
    ? `${operation} successful for user ID: ${userId}` 
    : `${operation} failed for user ID: ${userId}`;
  
  console.log(logMessage, details || '');
};
