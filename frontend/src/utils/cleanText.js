/**
 * Utility function to clean text and strip any unwanted "svg" text or prefixes.
 * @param {any} value
 * @returns {string}
 */
export function cleanText(value) {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/svg/gi, "").trim();
}

export default cleanText;
