import 'i18next';
import type analyzer from './locales/en/analyzer.json';
import type auth from './locales/en/auth.json';
import type common from './locales/en/common.json';
import type patient from './locales/en/patient.json';
import type report from './locales/en/report.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      analyzer: typeof analyzer;
      auth: typeof auth;
      patient: typeof patient;
      report: typeof report;
    };
  }
}
