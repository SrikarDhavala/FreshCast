import { colors } from '@/theme/colors';

export type ExpiryStatus = 'fresh' | 'soon' | 'urgent' | 'expired';

export function daysUntil(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateIso);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function expiryStatus(dateIso: string): ExpiryStatus {
  const days = daysUntil(dateIso);
  if (days < 0) return 'expired';
  if (days <= 2) return 'urgent';
  if (days <= 6) return 'soon';
  return 'fresh';
}

export function expiryLabel(dateIso: string): string {
  const days = daysUntil(dateIso);
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export function statusColor(status: ExpiryStatus): string {
  return colors.status[status];
}
