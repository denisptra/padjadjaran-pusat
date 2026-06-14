/**
 * Strips HTML tags from a string and returns plain text.
 * Useful for creating previews of rich text content.
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  
  // Replace HTML tags with an empty string
  const plainText = html.replace(/<[^>]*>?/gm, '');
  
  // Decode common HTML entities
  const decodedText = plainText
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
    
  return decodedText.trim();
};
