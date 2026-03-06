import type { Incident, CorrectiveAction } from './types';

// Helper — days until a date (negative = past)
export const daysUntil = (dateStr: string): number => {
  if (!dateStr) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86_400_000);
};

// Re-export types for consumers that import from mockData
export type { Incident, CorrectiveAction };
