import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { normalizeStatus } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/format';
import type { SeverityLevel } from '@/lib/severity';
import type { ParsedReport } from './parseReport';
import { scanKind, type ReportData } from './reportData';

const stripTags = (text: string) => text.replace(/<\/?\w+>/g, '');

interface PdfInput {
  data: ReportData;
  parsed: ParsedReport;
  urdu: string | null;
  level: SeverityLevel | null;
  patientName?: string;
}

/** Builds the PDF in English (real text) with the Urdu summary and disclaimer rendered as an image. */
export function usePdfDownload({ data, parsed, urdu, level, patientName }: PdfInput) {
  const { t, i18n } = useTranslation(['report', 'common']);
  const [pending, setPending] = useState(false);

  const download = useCallback(async () => {
    setPending(true);
    try {
      await i18n.loadNamespaces(['report', 'common', 'analyzer']);
      const [{ buildAndSavePdf }] = await Promise.all([import('./pdf'), i18n.loadLanguages(['en', 'ur'])]);
      const en = i18n.getFixedT('en', ['report', 'common', 'analyzer']);
      const ur = i18n.getFixedT('ur', ['report', 'common', 'analyzer']);
      // The PDF text is English; the on-screen sub-type label may be Urdu.
      const subtitle = data.subtype ? en(`analyzer:subtypes.${data.subtype}.label`) : null;
      const kind = scanKind(data.scanType);
      const date = formatDateTime(data.createdAt, 'en');
      const confidence =
        parsed.statedConfidence === null
          ? en('report:confidenceNotStated')
          : stripTags(en('report:confidence', { value: `${parsed.statedConfidence}%` }));

      await buildAndSavePdf({
        fileName: `MedCare-AI-${kind}-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        brand: en('common:brand'),
        subtitle: en('report:pdf.subtitle'),
        title: subtitle ? `${en(`common:reportTitles.${kind}`)} - ${subtitle}` : en(`common:reportTitles.${kind}`),
        meta: [
          ...(patientName ? ([[en('report:pdf.patient'), patientName]] as [string, string][]) : []),
          [en('report:pdf.scanType'), en(`common:scanTypes.${kind}`)],
          [en('report:pdf.date'), date],
          [en('report:pdf.reportId'), data.scanId ? `#${data.scanId}` : en('report:pdf.notSaved')],
          [en('report:pdf.severity'), en(level ? `common:severity.${level}` : 'common:severity.unknown')],
          [en('report:pdf.status'), en(`common:status.${normalizeStatus(data.status)}`)],
          [en('report:pdf.confidence'), confidence],
        ],
        disclaimer: [
          en('common:disclaimer.notDiagnosis'),
          en('common:disclaimer.doctorReview'),
          stripTags(en('common:disclaimer.emergency')),
        ],
        sections: parsed.sections,
        doctorNotes: data.doctorNotes ? { label: en('report:pdf.doctorNotes'), text: data.doctorNotes } : null,
        urdu: {
          label: en('report:pdf.urduSummary'),
          heading: ur('report:pdf.urduSummary'),
          text: urdu,
          disclaimer: [
            ur('common:disclaimer.notDiagnosis'),
            ur('common:disclaimer.doctorReview'),
            stripTags(ur('common:disclaimer.emergency')),
          ],
        },
        footer: en('report:pdf.footer'),
        pageLabel: (page, total) => en('report:pdf.page', { page, total }),
      });
      toast.success(t('report:pdfReady'));
    } catch (error) {
      console.error('PDF generation failed', error);
      toast.error(t('report:pdfFailed'));
    } finally {
      setPending(false);
    }
  }, [data, parsed, urdu, level, patientName, i18n, t]);

  return { pending, download };
}
