/**
 * Format a numeric amount as USD currency.
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format date in localized short or full form.
 */
export function formatDate(date: string | Date | null | undefined, locale = 'es-ES'): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

/**
 * Format bidder name into a privacy-preserving alias (Rule 18).
 * E.g. "Carlos Mendoza" -> "C***s M.", "Sofía" -> "S***a"
 */
export function formatBidderAlias(name: string | null | undefined): string {
  if (!name || !name.trim()) return 'Anónimo';
  const parts = name.trim().split(' ');
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : '';

  const maskedFirst =
    first.length <= 2 ? first + '***' : `${first[0]}***${first[first.length - 1]}`;
  const maskedLast = last ? ` ${last[0]}.` : '';
  return `${maskedFirst}${maskedLast}`;
}
