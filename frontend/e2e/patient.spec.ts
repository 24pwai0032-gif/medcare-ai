import { readFile } from 'node:fs/promises';
import { expect, prepare, samplePng, settle, test } from './fixtures';

test('patient: register, analyze a chest X-ray, read the report in English and Urdu, download the PDF, sign out', async ({
  page,
  context,
  api,
}) => {
  await prepare(context);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Understand your scans and medical reports, in English and Urdu');
  await expect(page.getByRole('complementary', { name: 'Medical disclaimer' })).toContainText('not a diagnosis');

  await page.getByRole('link', { name: 'Create an account' }).first().click();
  await expect(page).toHaveURL('/register');
  await page.getByLabel('Full name').fill('Zara Malik');
  await page.getByLabel('Email').fill('zara@example.com');
  await page.getByLabel('Password', { exact: true }).fill('secret12');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL('/app');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hello, Zara');
  expect(api.users.at(-1)).toMatchObject({ full_name: 'Zara Malik', email: 'zara@example.com', role: 'patient' });

  await page.getByRole('link', { name: 'X-ray and scans', exact: true }).click();
  await expect(page).toHaveURL('/app/analyze/xray');
  await page.locator('input[type="file"]').first().setInputFiles({ name: 'chest.png', mimeType: 'image/png', buffer: samplePng() });
  await page.getByRole('button', { name: 'Analyze image' }).click();

  // English report, with the disclaimer and the severity the report itself states.
  await expect(page.getByRole('tab', { name: 'English report' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('The lung fields are clear.')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Medical disclaimer' })).toBeVisible();
  expect(api.calls).toContain('POST /analyze/xray');

  await page.getByRole('tab', { name: 'Urdu summary' }).click();
  await expect(page.getByText('یہ نمونے کی رپورٹ کا اردو خلاصہ ہے۔', { exact: false })).toBeVisible();

  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  const pdf = await readFile((await download.path())!);
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  // The Urdu summary is embedded as an image, so a real PDF is well over a few kilobytes.
  expect(pdf.length).toBeGreaterThan(20_000);

  // The same report in the Urdu interface, right to left.
  await page.getByRole('button', { name: /اردو/ }).first().click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('tab', { name: 'انگریزی رپورٹ' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'PDF ڈاؤن لوڈ کریں' })).toBeVisible();

  // Nothing but the session and preferences is ever kept in the browser.
  const stored = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  expect(Object.keys(stored).sort()).toEqual(['medcare_lang', 'medcare_theme', 'medcare_token', 'medcare_user']);
  expect(JSON.stringify(stored)).not.toContain('lung');

  await page.getByRole('button', { name: 'سائن آؤٹ کریں' }).first().click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('اپنے اسکین اور میڈیکل رپورٹس انگریزی اور اردو میں سمجھیں');
  expect(await page.evaluate(() => localStorage.getItem('medcare_token'))).toBeNull();
});

test('patient: sign in and open a reviewed report from the history', async ({ page, context }) => {
  await prepare(context);
  await page.goto('/login');
  await page.getByLabel('Email').fill('bilal@example.com');
  await page.getByLabel('Password', { exact: true }).fill('patient123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('/app');

  await page.getByRole('link', { name: 'My scans', exact: true }).click();
  await settle(page);
  await page.getByRole('main').getByRole('link', { name: /Blood test/ }).first().click();
  await expect(page).toHaveURL('/app/scans/37');
  await expect(page.getByText('Approved by a doctor')).toBeVisible();
  await expect(page.getByText('Mild anaemia.', { exact: false })).toBeVisible();
});

test('a wrong password shows a clear English error, not the backend text', async ({ page, context }) => {
  await prepare(context);
  await page.goto('/login');
  await page.getByLabel('Email').fill('bilal@example.com');
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('alert')).not.toContainText('Galat');
  await expect(page).toHaveURL('/login');
});
