import { Bone, HeartPulse, Pill, ScanLine, TestTube, type LucideIcon } from 'lucide-react';
import type { Tone } from '@/components/IconChip';
import type { SubtypeId } from '@/features/report/reportData';
import type { AnalyzeEndpoint } from '@/services/types';

export type ModuleId = 'xray' | 'bone' | 'ecg' | 'blood' | 'prescription';

export interface Subtype {
  id: SubtypeId;
  endpoint: AnalyzeEndpoint;
}

/**
 * One analyzer, configured per module. Titles, descriptions, capture tips and loading copy
 * live in analyzer.json under `modules.<id>`.
 */
export interface AnalyzerModule {
  id: ModuleId;
  endpoint: AnalyzeEndpoint;
  icon: LucideIcon;
  /** Its colour on tiles, cards and page headers. */
  tone: Tone;
  subtypes?: Subtype[];
}

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
/** Gemini's inline-image limit is ~20 MB after base64; 10 MB leaves room and suits 3G uploads. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const ANALYZER_MODULES: Record<ModuleId, AnalyzerModule> = {
  xray: {
    id: 'xray',
    endpoint: 'xray',
    icon: ScanLine,
    tone: 'indigo',
    // There is no MRI or CT endpoint: those use the X-ray instructions, and the UI says so.
    subtypes: [
      { id: 'chest', endpoint: 'xray' },
      { id: 'mri', endpoint: 'xray' },
      { id: 'ct', endpoint: 'xray' },
      { id: 'bone', endpoint: 'bone' },
    ],
  },
  bone: { id: 'bone', endpoint: 'bone', icon: Bone, tone: 'violet' },
  ecg: { id: 'ecg', endpoint: 'ecg', icon: HeartPulse, tone: 'rose' },
  blood: { id: 'blood', endpoint: 'blood-test', icon: TestTube, tone: 'emerald' },
  prescription: { id: 'prescription', endpoint: 'prescription', icon: Pill, tone: 'amber' },
};

export const MODULE_IDS = Object.keys(ANALYZER_MODULES) as ModuleId[];

export const getModule = (id: string | undefined) =>
  id && id in ANALYZER_MODULES ? ANALYZER_MODULES[id as ModuleId] : null;

export type FileProblem = 'type' | 'size' | 'empty';

export function validateFile(file: File): FileProblem | null {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) return 'type';
  if (file.size === 0) return 'empty';
  if (file.size > MAX_FILE_BYTES) return 'size';
  return null;
}
