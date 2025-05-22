
/**
 * Sanitizes user input to prevent potential issues
 * @param input The user input string to sanitize
 * @returns The sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous HTML/script tags
  const withoutTags = input.replace(/<\/?[^>]+(>|$)/g, "");
  
  // Normalize whitespace
  return withoutTags.trim();
};
