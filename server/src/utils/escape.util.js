/**
 * Escapes HTML characters in a string to prevent XSS and HTML injection.
 * 
 * @param {string} unsafe - The string to escape.
 * @returns {string} - The escaped HTML string.
 */
export const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
