// Dev-only preview of the signed-in app shell (/design/shell).
import { AppDataProvider } from '@/app/AppDataProvider';
import { AppShell } from '@/components/layout/AppShell';
import { SeverityBadge } from '@/components/SeverityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';

export function ShellPreviewLayout() {
  return (
    <AppDataProvider>
      <AppShell role="patient" />
    </AppDataProvider>
  );
}

export function ShellPreviewContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">App shell preview</h1>
      <p className="text-muted-foreground">Sidebar on desktop; top bar and bottom navigation below 1024 px.</p>
      {[1, 2, 3].map((n) => (
        <Card key={n}>
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="me-auto font-semibold">Chest X-ray #{n}</span>
            <SeverityBadge level={n === 1 ? 'normal' : n === 2 ? 'moderate' : 'severe'} />
            <StatusBadge status={n === 1 ? 'approved' : n === 2 ? 'pending' : 'rejected'} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
