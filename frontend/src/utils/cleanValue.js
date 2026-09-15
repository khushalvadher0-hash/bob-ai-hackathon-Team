export function cleanText(value) {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/svg/gi, "").trim();
}

/**
 * Utility to clean string values and remove unwanted prefixes like "svg", "<svg>", or stray tokens.
 * @param {any} val
 * @returns {string} Clean string value
 */
export function cleanValue(val) {
  if (val === null || val === undefined) {
    return '';
  }

  let str = String(val).trim();
  str = str.replace(/svg/gi, '').replace(/<[^>]*>/g, '');
  return str.trim();
}

export default cleanValue;

