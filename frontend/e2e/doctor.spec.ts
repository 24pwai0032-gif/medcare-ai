import { DOCTOR, expect, prepare, test } from './fixtures';

test('doctor: sign in, open the pending report and approve it with notes', async ({ page, context, api }) => {
  await prepare(context);
  await page.goto('/login');
  await page.getByLabel('Email').fill(DOCTOR.email);
  await page.getByLabel('Password', { exact: true }).fill(DOCTOR.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page).toHaveURL('/doctor');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Review queue');
  await page.getByRole('link', { name: /Bilal Ahmed/ }).first().click();
  await expect(page).toHaveURL('/doctor/scans/41');

  // The stored severity comes from a keyword match; the report itself says Moderate.
  await expect(page.getByText('The report text states Moderate; the stored severity is Severe.')).toBeVisible();

  const notes = 'I agree with the AI reading. Please see your GP this week to discuss it.';
  await page.getByLabel('Notes for the patient').fill(notes);
  await page.getByRole('button', { name: 'Approve report' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Approve this report?' });
  await dialog.getByRole('button', { name: 'Approve report' }).click();

  await expect(page.getByText('Report approved.')).toBeVisible();
  await expect(page).toHaveURL('/doctor');
  expect(api.calls).toContain('PUT /users/doctor/approve-scan/41');
  expect(api.scans.find((scan) => scan.id === 41)).toMatchObject({ status: 'approved', doctor_notes: notes });
  await expect(page.getByText('No reports are waiting for review')).toBeVisible();
});

test('doctor: flagging a report requires notes', async ({ page, context, api }) => {
  await prepare(context, { user: DOCTOR });
  await page.goto('/doctor/scans/41');
  await page.getByRole('button', { name: 'Flag for attention' }).click();
  await expect(page.getByText('Add notes so the patient knows what to do next.')).toBeVisible();
  expect(api.calls.filter((call) => call.startsWith('PUT'))).toEqual([]);
});
