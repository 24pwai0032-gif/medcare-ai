import 'i18next';
import type analyzer from './locales/en/analyzer.json';
import type common from './locales/en/common.json';
import type report from './locales/en/report.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      analyzer: typeof analyzer;
      report: typeof report;
    };
  }
}
