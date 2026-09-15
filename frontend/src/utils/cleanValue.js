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

  // Strip leading "svg" prefix if present (case-insensitive)
  // e.g. "svgB01" -> "B01", "svgScheduled" -> "Scheduled", "svg2026-09-15" -> "2026-09-15"
  if (/^svg/i.test(str)) {
    str = str.replace(/^svg\s*[-_:]?\s*/i, '');
  }

  // Remove any stray html/svg tag fragments
  str = str.replace(/<[^>]*>/g, '');

  return str.trim();
}

export default cleanValue;
