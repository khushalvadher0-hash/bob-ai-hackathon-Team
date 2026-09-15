export function getStatusBadgeClass(levelOrStatus) {
  if (!levelOrStatus) return 'badge-low';
  const val = String(levelOrStatus).toUpperCase();
  if (val.includes('CRITICAL')) return 'badge-critical';
  if (val.includes('HIGH')) return 'badge-high';
  if (val.includes('MEDIUM') || val.includes('MED')) return 'badge-medium';
  return 'badge-low';
}

export function getStatusColor(level) {
  switch (String(level).toUpperCase()) {
    case 'CRITICAL':
      return '#ef4444';
    case 'HIGH':
      return '#f97316';
    case 'MEDIUM':
      return '#f59e0b';
    case 'LOW':
    default:
      return '#10b981';
  }
}
