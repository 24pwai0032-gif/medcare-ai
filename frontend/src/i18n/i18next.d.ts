import 'i18next';
import type analyzer from './locales/en/analyzer.json';
import type auth from './locales/en/auth.json';
import type common from './locales/en/common.json';
import type doctor from './locales/en/doctor.json';
import type emergency from './locales/en/emergency.json';
import type patient from './locales/en/patient.json';
import type report from './locales/en/report.json';
import type tools from './locales/en/tools.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      doctor: typeof doctor;
      emergency: typeof emergency;
      analyzer: typeof analyzer;
      auth: typeof auth;
      patient: typeof patient;
      report: typeof report;
      tools: typeof tools;
    };
  }
}
