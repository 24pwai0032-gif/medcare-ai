import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newestFirst, scanKeys } from '@/features/scans/scans';
import { api } from '@/services/api';

export type ReviewDecision = 'approve' | 'reject';

export function usePendingScans() {
  return useQuery({ queryKey: scanKeys.pending, queryFn: api.pendingScans });
}

/** Every scan, all statuses. Also the source for /doctor/scans/:id (there is no single-scan endpoint). */
export function useAllScans() {
  return useQuery({
    queryKey: scanKeys.all,
    queryFn: api.allScans,
    select: (scans) => [...scans].sort(newestFirst),
  });
}

export function useReviewScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, notes }: { id: number; decision: ReviewDecision; notes: string }) =>
      decision === 'approve' ? api.approveScan(id, notes) : api.rejectScan(id, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scans'] }),
  });
}
