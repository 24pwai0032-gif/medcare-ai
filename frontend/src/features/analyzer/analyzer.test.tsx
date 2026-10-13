import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDataProvider } from '@/app/AppDataProvider';
import { uploadForAnalysis } from '@/services/api';
import { ApiError } from '@/services/errors';
import type { AnalyzeResponse } from '@/services/types';
import { renderRoutes, signInAs } from '@/test/render';
import AnalyzerPage from './AnalyzerPage';
import { MAX_FILE_BYTES, validateFile } from './modules';

vi.mock('@/services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api')>();
  return { ...actual, uploadForAnalysis: vi.fn(), warmUpBackend: vi.fn() };
});

const RESULT: AnalyzeResponse = {
  scan_id: 41,
  scan_saved: true,
  scan_type: 'xray',
  report:
    '**FINDINGS**: Clear lungs. No severe abnormality.\n\n**SEVERITY**: Normal\n\n**CONFIDENCE**: 82%\n\n**اردو خلاصہ**: پھیپھڑے صاف ہیں۔',
  urdu_report: 'پھیپھڑے صاف ہیں۔',
  severity: 'Severe',
  confidence: 82,
  time: 12.4,
};

const image = (name = 'chest.jpg', type = 'image/jpeg', size = 2048) =>
  new File([new Uint8Array(size)], name, { type });

function renderAnalyzer(module = 'xray') {
  signInAs('patient');
  return renderRoutes(
    [
      {
        path: '/app/analyze/:module',
        element: (
          <AppDataProvider>
            <AnalyzerPage />
          </AppDataProvider>
        ),
      },
    ],
    `/app/analyze/${module}`,
  );
}

async function chooseFile(file: File) {
  fireEvent.change(await screen.findByTestId('file-input'), { target: { files: [file] } });
}

beforeEach(() => {
  vi.mocked(uploadForAnalysis).mockReset();
});

describe('validateFile', () => {
  it('accepts JPEG, PNG and WebP up to 10 MB', () => {
    expect(validateFile(image())).toBeNull();
    expect(validateFile(image('a.png', 'image/png'))).toBeNull();
    expect(validateFile(image('a.heic', 'image/heic'))).toBe('type');
    expect(validateFile(image('a.pdf', 'application/pdf'))).toBe('type');
    expect(validateFile(image('a.jpg', 'image/jpeg', 0))).toBe('empty');
    expect(validateFile(image('a.jpg', 'image/jpeg', MAX_FILE_BYTES + 1))).toBe('size');
  });
});

describe('Analyzer', () => {
  it('uploads, shows honest progress, then the report', async () => {
    let finish: (value: AnalyzeResponse) => void = () => undefined;
    vi.mocked(uploadForAnalysis).mockImplementation((_endpoint, _file, options) => {
      options?.onUploadProgress?.(0.4);
      return new Promise((resolve) => {
        finish = resolve;
        setTimeout(() => options?.onUploaded?.(), 0);
      });
    });
    const user = userEvent.setup();
    renderAnalyzer();

    expect(await screen.findByRole('heading', { name: 'X-ray and scan analysis' })).toBeInTheDocument();
    const analyze = screen.getByRole('button', { name: 'Analyze image' });
    expect(analyze).toBeDisabled();

    await chooseFile(image());
    await user.click(screen.getByRole('button', { name: 'Analyze image' }));
    expect(uploadForAnalysis).toHaveBeenCalledWith('xray', expect.any(File), expect.any(Object));
    expect(await screen.findByText('The AI is reading your X-ray…')).toBeInTheDocument();
    expect(screen.getByText(/can take up to 2 minutes/)).toBeInTheDocument();

    finish(RESULT);
    expect(await screen.findByRole('heading', { level: 1, name: /X-ray report/ })).toBeInTheDocument();
    // The report says Normal; the API's keyword match said Severe.
    expect(screen.getByText('Severity:', { exact: false }).parentElement).toHaveTextContent('Severity: Normal');
    expect(screen.getByText(/model confidence, not diagnostic certainty/)).toHaveTextContent('82%');
    expect(screen.getByText('AI output is informational, not a diagnosis.')).toBeInTheDocument();
    expect(screen.getByText("Waiting for a doctor's review")).toBeInTheDocument();
  });

  it('shows the Urdu summary right to left in its own tab', async () => {
    vi.mocked(uploadForAnalysis).mockResolvedValue(RESULT);
    const user = userEvent.setup();
    renderAnalyzer();
    await chooseFile(image());
    await user.click(await screen.findByRole('button', { name: 'Analyze image' }));
    await user.click(await screen.findByRole('tab', { name: 'Urdu summary' }));
    const urdu = await screen.findByText('پھیپھڑے صاف ہیں۔');
    expect(urdu.closest('[lang="ur"]')).toHaveAttribute('dir', 'rtl');
  });

  it('sends a bone X-ray sub-type to the bone endpoint', async () => {
    vi.mocked(uploadForAnalysis).mockResolvedValue({ ...RESULT, scan_type: 'bone' });
    const user = userEvent.setup();
    renderAnalyzer();
    await user.click(await screen.findByRole('radio', { name: /Bone X-ray/ }));
    await chooseFile(image());
    await user.click(screen.getByRole('button', { name: 'Analyze image' }));
    await waitFor(() => expect(uploadForAnalysis).toHaveBeenCalledWith('bone', expect.any(File), expect.any(Object)));
  });

  it('rejects unsupported files before uploading', async () => {
    renderAnalyzer('ecg');
    await chooseFile(image('report.pdf', 'application/pdf'));
    expect(await screen.findByText(/This file type isn't supported/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze image' })).toBeDisabled();
    expect(uploadForAnalysis).not.toHaveBeenCalled();
  });

  it('explains that a cancelled analysis may still finish', async () => {
    vi.mocked(uploadForAnalysis).mockImplementation((_endpoint, _file, options) => {
      options?.onUploaded?.();
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => reject(new ApiError('aborted')));
      });
    });
    const user = userEvent.setup();
    renderAnalyzer('blood');
    await chooseFile(image());
    await user.click(await screen.findByRole('button', { name: 'Analyze image' }));
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(await screen.findByText(/The analysis may still finish/)).toBeInTheDocument();
  });

  it('shows a translated error and keeps the file for a retry', async () => {
    vi.mocked(uploadForAnalysis).mockImplementation(async () => {
      throw new ApiError('aiUnavailable', 502);
    });
    const user = userEvent.setup();
    renderAnalyzer('prescription');
    await chooseFile(image());
    await user.click(await screen.findByRole('button', { name: 'Analyze image' }));
    expect(await screen.findByText(/The AI service is busy or unavailable/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze image' })).toBeEnabled();
  });

  it('shows a not-found state for an unknown module', async () => {
    renderAnalyzer('teeth');
    expect(await screen.findByText("This type of analysis doesn't exist.")).toBeInTheDocument();
  });
});
