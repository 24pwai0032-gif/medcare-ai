// Dev-only style guide (/design). Sample copy here is intentionally not translated.
import { Inbox } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Disclaimer, EmergencyCallButtons } from '@/components/Disclaimer';
import { LanguageToggle, ThemeToggle } from '@/components/layout/toggles';
import { Logo } from '@/components/Logo';
import { SeverityBadge } from '@/components/SeverityBadge';
import { EmptyState, ErrorState, PageLoader } from '@/components/states';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, Skeleton } from '@/components/ui/feedback';
import { Progress } from '@/components/ui/progress';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioCard, RadioGroup } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEVERITY_LEVELS } from '@/lib/severity';
import { ApiError } from '@/services/errors';

const TOKENS = [
  'background', 'surface', 'foreground', 'muted', 'muted-foreground', 'border', 'input', 'ring',
  'primary', 'primary-hover', 'secondary', 'accent', 'destructive', 'info', 'warning', 'emergency',
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignPage() {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center gap-3">
        <Logo />
        <span className="me-auto rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground">/design · dev only</span>
        <Link to="/design/shell" className="text-sm font-semibold text-primary underline">App shell preview</Link>
        <LanguageToggle />
        <ThemeToggle />
      </header>

      <Section title="Colour tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TOKENS.map((token) => (
            <div key={token} className="overflow-hidden rounded-md border bg-surface text-sm">
              <div className="h-12 border-b" style={{ background: `var(--${token})` }} />
              <p className="px-2 py-1.5 font-mono text-xs">--{token}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <Card>
          <CardContent className="space-y-3">
            <p className="text-3xl font-semibold">Upload your X-ray</p>
            <p className="text-2xl font-semibold">Doctor review pending</p>
            <p className="text-xl font-semibold">Recent scans</p>
            <p>AI output is informational, not a diagnosis. A doctor must review every report.</p>
            <p className="text-sm text-muted-foreground">Small text 14/20 for hints and metadata.</p>
            <p className="tabular-nums">BP 120/80 mmHg · HR 72 bpm · SpO₂ 98%</p>
            <p lang="ur" dir="rtl" className="urdu-block">
              یہ رپورٹ مصنوعی ذہانت نے تیار کی ہے اور صرف معلومات کے لیے ہے، تشخیص نہیں۔ ہنگامی صورت میں 1122 یا 115 پر کال کریں۔
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Severity and review status (icon + word, never colour alone)">
        <div className="flex flex-wrap gap-2">
          {SEVERITY_LEVELS.map((level) => (
            <SeverityBadge key={level} level={level} />
          ))}
          <SeverityBadge level={null} />
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="pending" />
          <StatusBadge status="approved" />
          <StatusBadge status="rejected" />
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="emergency">Emergency</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Form controls">
        <Card>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="d-email">Email</Label>
              <Input id="d-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="d-invalid">Field with an error</Label>
              <Input id="d-invalid" aria-invalid="true" aria-describedby="d-invalid-msg" defaultValue="abc" />
              <p id="d-invalid-msg" className="text-sm text-destructive">Enter a valid email address.</p>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="d-notes">Doctor notes</Label>
              <Textarea id="d-notes" placeholder="Notes for the patient" />
            </div>
            <fieldset className="grid gap-2 sm:col-span-2">
              <legend className="mb-2 text-sm font-semibold">Little interest or pleasure in doing things</legend>
              <RadioGroup defaultValue="1" aria-label="Answer">
                {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((label, i) => (
                  <RadioCard key={label} id={`d-r${i}`} value={String(i)}>
                    {label}
                  </RadioCard>
                ))}
              </RadioGroup>
            </fieldset>
            <div className="grid gap-2 sm:col-span-2">
              <p className="text-sm font-semibold">Upload progress</p>
              <Progress value={62} aria-label="Upload progress" />
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Disclaimer and emergency">
        <Disclaimer />
        <EmergencyCallButtons />
        <Alert variant="warning" role="note">The first request after a quiet period can take up to 2 minutes.</Alert>
        <Alert variant="destructive" role="note">Crisis panel style.</Alert>
      </Section>

      <Section title="Tabs">
        <Card>
          <CardHeader>
            <CardTitle>Report</CardTitle>
            <CardDescription>English and Urdu versions of the AI report.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="en">
              <TabsList>
                <TabsTrigger value="en">English report</TabsTrigger>
                <TabsTrigger value="ur">{t('language.ur')}</TabsTrigger>
              </TabsList>
              <TabsContent value="en" lang="en">Findings, impression and recommendations appear here.</TabsContent>
              <TabsContent value="ur" lang="ur" dir="rtl" className="urdu-block">
                رپورٹ کا اردو خلاصہ یہاں دکھایا جائے گا۔
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Section>

      <Section title="States">
        <div className="grid gap-4 sm:grid-cols-2">
          <EmptyState icon={Inbox} title="No scans yet" description="Your reports will appear here." action={<Button>Upload a scan</Button>} />
          <ErrorState error={new ApiError('network')} onRetry={() => undefined} />
          <div className="space-y-2 rounded-lg border bg-surface p-5">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <PageLoader className="rounded-lg border bg-surface" />
        </div>
      </Section>

      <Section title="Confirm dialog">
        <Button variant="outline" onClick={() => setConfirmOpen(true)}>Open confirm dialog</Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Approve this report?"
          description="The patient will see your notes."
          confirmLabel="Approve"
          onConfirm={() => setConfirmOpen(false)}
        />
      </Section>
    </div>
  );
}
