export function formatDateParts(dateString) {
  const d = new Date(dateString);
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: d.toLocaleString('en-US', { day: '2-digit' }),
    year: d.getFullYear(),
    time: d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

export function formatFullDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
