import { cleanText } from './cleanText';

export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const cleaned = cleanText(dateString);
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString();
    }
    return cleaned;
  } catch {
    return cleanText(dateString);
  }
}

export default formatDate;

