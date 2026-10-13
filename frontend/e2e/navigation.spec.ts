import { DOCTOR, expect, PATIENT, prepare, settle, test } from './fixtures';

test('public pages work with the back button', async ({ page, context }) => {
  await prepare(context);
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Footer' }).getByRole('link', { name: 'Emergency' }).click();
  await expect(page).toHaveURL('/emergency');
  await page.getByRole('link', { name: 'Heart attack' }).click();
  await expect(page).toHaveURL('/emergency/heart-attack');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Heart attack');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Emergency first aid');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Understand your scans and medical reports, in English and Urdu');
  await page.goForward();
  await expect(page).toHaveURL('/emergency');
});

test('patient pages work with the back button', async ({ page, context }) => {
  await prepare(context, { user: PATIENT });
  await page.goto('/app');
  await settle(page);
  await page.getByRole('link', { name: 'My scans', exact: true }).click();
  await expect(page).toHaveURL('/app/scans');
  await page.getByRole('main').getByRole('link', { name: /Blood test/ }).first().click();
  await expect(page).toHaveURL('/app/scans/37');
  await page.goBack();
  await expect(page).toHaveURL('/app/scans');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('My scans');
  await page.goBack();
  await expect(page).toHaveURL('/app');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hello, Bilal');
});

test('doctor filters live in the URL and survive the back button', async ({ page, context }) => {
  await prepare(context, { user: DOCTOR });
  await page.goto('/doctor/scans');
  await settle(page);
  await page.getByLabel('Review status').selectOption('approved');
  await expect(page).toHaveURL(/status=approved/);
  await page.getByRole('link', { name: /Bilal Ahmed/ }).first().click();
  await expect(page).toHaveURL('/doctor/scans/37?from=all');
  await page.goBack();
  await expect(page).toHaveURL(/\/doctor\/scans\?status=approved/);
  await expect(page.getByLabel('Review status')).toHaveValue('approved');
});

test('signed-out visitors are sent to sign in and come back afterwards', async ({ page, context }) => {
  await prepare(context);
  await page.goto('/app/vitals');
  await expect(page).toHaveURL('/login?next=%2Fapp%2Fvitals');
  await page.getByLabel('Email').fill(PATIENT.email);
  await page.getByLabel('Password', { exact: true }).fill(PATIENT.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('/app/vitals');
});

test('an expired session ends on the first 401 and returns to sign in', async ({ page, context }) => {
  // A token the API no longer accepts.
  await prepare(context, { user: { ...PATIENT, id: 99 } });
  await page.goto('/app/scans');
  await expect(page).toHaveURL('/login?next=%2Fapp%2Fscans&expired=1');
  await expect(page.getByText('Your session has ended. Sign in again to continue.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('medcare_token'))).toBeNull();
});

test('patients cannot open doctor pages', async ({ page, context }) => {
  await prepare(context, { user: PATIENT });
  await page.goto('/doctor');
  await expect(page).toHaveURL('/app');
});
