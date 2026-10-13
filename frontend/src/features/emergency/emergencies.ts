import { Bone, Droplet, Flame, HeartPulse, Wind, Zap, type LucideIcon } from 'lucide-react';

export type EmergencyId = 'heartAttack' | 'choking' | 'burns' | 'bleeding' | 'fracture' | 'seizure';

/** Content lives in emergency.json; the Urdu steps match the English one-to-one (enforced by the parity test). */
export const EMERGENCIES: ReadonlyArray<{ id: EmergencyId; slug: string; icon: LucideIcon }> = [
  { id: 'heartAttack', slug: 'heart-attack', icon: HeartPulse },
  { id: 'choking', slug: 'choking', icon: Wind },
  { id: 'burns', slug: 'burns', icon: Flame },
  { id: 'bleeding', slug: 'bleeding', icon: Droplet },
  { id: 'fracture', slug: 'fracture', icon: Bone },
  { id: 'seizure', slug: 'seizure', icon: Zap },
];

export const emergencyBySlug = (slug: string | undefined) => EMERGENCIES.find((e) => e.slug === slug) ?? null;
