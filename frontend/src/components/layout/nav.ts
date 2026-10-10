import {
  Activity,
  Bone,
  Brain,
  ClipboardList,
  HeartPulse,
  History,
  House,
  Inbox,
  Pill,
  ScanLine,
  Siren,
  Stethoscope,
  TestTube,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/services/types';

export type NavLabelKey =
  | 'nav.home'
  | 'nav.scans'
  | 'nav.emergency'
  | 'nav.queue'
  | 'nav.allScans'
  | 'modules.xray'
  | 'modules.bone'
  | 'modules.ecg'
  | 'modules.blood'
  | 'modules.prescription'
  | 'modules.diagnosis'
  | 'modules.mentalHealth'
  | 'modules.vitals';

export interface NavItem {
  to: string;
  labelKey: NavLabelKey;
  icon: LucideIcon;
  /** Match the path exactly (for index routes). */
  end?: boolean;
  /** Also shown in the mobile bottom bar. */
  mobile?: boolean;
  group: 'main' | 'analyze' | 'tools';
  tone?: 'emergency';
}

export const NAV: Record<Role, NavItem[]> = {
  patient: [
    { to: '/app', labelKey: 'nav.home', icon: House, end: true, mobile: true, group: 'main' },
    { to: '/app/scans', labelKey: 'nav.scans', icon: History, mobile: true, group: 'main' },
    { to: '/app/analyze/xray', labelKey: 'modules.xray', icon: ScanLine, group: 'analyze' },
    { to: '/app/analyze/bone', labelKey: 'modules.bone', icon: Bone, group: 'analyze' },
    { to: '/app/analyze/ecg', labelKey: 'modules.ecg', icon: HeartPulse, group: 'analyze' },
    { to: '/app/analyze/blood', labelKey: 'modules.blood', icon: TestTube, group: 'analyze' },
    { to: '/app/analyze/prescription', labelKey: 'modules.prescription', icon: Pill, group: 'analyze' },
    { to: '/app/diagnosis', labelKey: 'modules.diagnosis', icon: Stethoscope, group: 'tools' },
    { to: '/app/mental-health', labelKey: 'modules.mentalHealth', icon: Brain, group: 'tools' },
    { to: '/app/vitals', labelKey: 'modules.vitals', icon: Activity, group: 'tools' },
    { to: '/emergency', labelKey: 'nav.emergency', icon: Siren, mobile: true, group: 'main', tone: 'emergency' },
  ],
  doctor: [
    { to: '/doctor', labelKey: 'nav.queue', icon: Inbox, end: true, mobile: true, group: 'main' },
    { to: '/doctor/scans', labelKey: 'nav.allScans', icon: ClipboardList, mobile: true, group: 'main' },
    { to: '/emergency', labelKey: 'nav.emergency', icon: Siren, mobile: true, group: 'main', tone: 'emergency' },
  ],
};
