/**
 * Shared training data: types, mock records, and helpers.
 * Used by TrainingCertification and TrainingDetail.
 */

export interface TrainingRecord {
  id: string;
  name: string;
  location: string;
  initials: string;
  avatarColor: string;
  avatar?: string;
  course: string;
  courseIcon: string;
  certName: string;
  trainingStartDate: string;
  trainingEndDate: string;
  expiryDate: string;
  status: 'Trained' | 'Not Trained';
  certDocument?: string;
  certDocumentData?: string;  // base64 data URL for preview
}

export const TRAINING_TYPES: { label: string; icon: string; cert: string }[] = [
  { label: 'Level 2 Chemical Handling', icon: 'science', cert: 'Chemical Handling Certificate' },
  { label: 'Standard Operating Procedures', icon: 'menu_book', cert: 'SOP Compliance Certificate' },
  { label: 'Fire Safety Awareness', icon: 'local_fire_department', cert: 'Fire Safety Certificate' },
  { label: 'COSHH Awareness', icon: 'health_and_safety', cert: 'COSHH Awareness Certificate' },
  { label: 'Manual Handling Training', icon: 'engineering', cert: 'Manual Handling Certificate' },
  { label: 'Health & Safety Induction', icon: 'verified_user', cert: 'H&S Induction Certificate' },
  { label: 'First Aid at Work', icon: 'medical_services', cert: 'First Aid Certificate' },
  { label: 'Working at Height', icon: 'altitude', cert: 'Working at Height Certificate' },
  { label: 'Asbestos Awareness', icon: 'warning', cert: 'Asbestos Awareness Certificate' },
  { label: 'Legionella Awareness', icon: 'water_drop', cert: 'Legionella Awareness Certificate' },
];

export const AVATAR_COLORS = [
  'bg-blue-500', 'bg-pink-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-orange-500', 'bg-rose-500', 'bg-sky-500', 'bg-teal-500',
  'bg-indigo-500', 'bg-amber-500', 'bg-cyan-500', 'bg-lime-500',
];

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/** Initial training records - empty for fresh start (add via Training Certification UI) */
export const INITIAL_TRAINING_RECORDS: TrainingRecord[] = [];

export const formatDate = (d: string): string => {
  if (!d || d.trim() === '') return '—';
  try {
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  catch { return d || '—'; }
};
