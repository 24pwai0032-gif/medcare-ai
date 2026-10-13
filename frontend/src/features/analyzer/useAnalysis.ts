import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, toApiError } from '@/services/errors';
import { uploadForAnalysis } from '@/services/api';
import type { AnalyzeEndpoint, AnalyzeResponse } from '@/services/types';

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'analyzing'; startedAt: number }
  | { status: 'done'; result: AnalyzeResponse }
  | { status: 'cancelled'; afterUpload: boolean }
  | { status: 'error'; error: ApiError; afterUpload: boolean };

/**
 * Upload with real progress, then an honest "AI is working" phase (no fake percentage).
 * Cancelling stops waiting; once the upload has finished, the server may still finish the job.
 */
export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);
  const uploadedRef = useRef(false);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const start = useCallback(async (file: File, endpoint: AnalyzeEndpoint) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    uploadedRef.current = false;
    setState({ status: 'uploading', progress: 0 });
    try {
      const result = await uploadForAnalysis(endpoint, file, {
        signal: controller.signal,
        onUploadProgress: (progress) =>
          setState((current) => (current.status === 'uploading' ? { status: 'uploading', progress } : current)),
        onUploaded: () => {
          uploadedRef.current = true;
          setState({ status: 'analyzing', startedAt: Date.now() });
        },
      });
      if (controller.signal.aborted) return null;
      setState({ status: 'done', result });
      return result;
    } catch (error) {
      const apiError = toApiError(error);
      const afterUpload = uploadedRef.current;
      setState(
        apiError.code === 'aborted' ? { status: 'cancelled', afterUpload } : { status: 'error', error: apiError, afterUpload },
      );
      return null;
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => controllerRef.current?.abort(), []);
  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, start, cancel, reset };
}
