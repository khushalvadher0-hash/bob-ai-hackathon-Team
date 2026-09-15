export function getStatusBadgeClass(levelOrStatus) {
  if (!levelOrStatus) return 'badge-low';
  const val = String(levelOrStatus).toUpperCase().trim();
  
  if (val.includes('CRITICAL') || val === 'MAINTENANCE') {
    return 'badge-critical';
  }
  if (val.includes('HIGH') || val === 'OCCUPIED' || val === 'QUEUED' || val === 'WAITING') {
    return 'badge-high';
  }
  if (val.includes('MEDIUM') || val.includes('MED') || val === 'APPROACHING' || val === 'ACTIVE') {
    return 'badge-medium';
  }
  if (val.includes('LOW') || val === 'AVAILABLE' || val === 'SCHEDULED' || val === 'BERTHED') {
    return 'badge-low';
  }
  return 'badge-low';
}

export function getStatusColor(levelOrStatus) {
  if (!levelOrStatus) return '#10b981';
  const val = String(levelOrStatus).toUpperCase().trim();
  
  if (val.includes('CRITICAL') || val === 'MAINTENANCE') {
    return '#ef4444';
  }
  if (val.includes('HIGH') || val === 'OCCUPIED' || val === 'QUEUED' || val === 'WAITING') {
    return '#f97316';
  }
  if (val.includes('MEDIUM') || val.includes('MED') || val === 'APPROACHING' || val === 'ACTIVE') {
    return '#f59e0b';
  }
  if (val.includes('LOW') || val === 'AVAILABLE' || val === 'SCHEDULED' || val === 'BERTHED') {
    return '#10b981';
  }
  return '#10b981';
}
