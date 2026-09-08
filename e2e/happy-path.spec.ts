import { test, expect } from '@playwright/test';

/**
 * Requires the local Supabase stack (`npx supabase start`) with `enable_confirmations = false`.
 * It signs up real users, so it must never be pointed at the hosted project. See the README.
 */
test('sign up, add a job, add an expense against it, see the figures', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto('/signup');
  await page.getByLabel('Business name').fill('Chioma Catering');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Create account' }).click();
  // signUp never redirects — confirmation may be required in production, so it hands back a
  // "check your inbox" panel either way and the sign-in below is a separate trip.
  await expect(page.getByRole('link', { name: 'sign in' })).toBeVisible();

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');

  await page.getByRole('link', { name: 'Jobs' }).click();
  await page.getByRole('button', { name: 'Add job' }).first().click();
  await page.getByLabel('Job name').fill('Adeyemi Wedding');
  await page.getByLabel('Quoted price (₦, optional)').fill('650000');
  await page.getByRole('button', { name: 'Add job' }).last().click();
  await expect(page.getByRole('heading', { name: 'Adeyemi Wedding' })).toBeVisible();

  await page.getByRole('link', { name: 'Expenses' }).click();
  await page.getByRole('button', { name: 'Add expense' }).first().click();
  await page.getByLabel('Amount (₦)').fill('120000');
  await page.getByLabel('Description').fill('Bulk market run');
  await page.getByLabel('Category').selectOption({ label: 'Ingredients' });
  await page.getByLabel('Job (optional)').selectOption({ label: 'Adeyemi Wedding' });
  await page.getByRole('button', { name: 'Add expense' }).last().click();
  await expect(page.getByText('Bulk market run')).toBeVisible();

  await page.getByRole('link', { name: 'Jobs' }).click();
  const card = page.getByRole('article').filter({ hasText: 'Adeyemi Wedding' });

  // `exact` matters: profit renders as -₦120,000, which a substring match would also hit, and the
  // assertion would pass whether or not the spend figure reached the card at all.
  await expect(card.getByText('₦120,000', { exact: true })).toBeVisible();
  // Quoted and Outstanding are both ₦650,000 because nothing has been collected yet. Asserting the
  // pair, rather than picking one, is what pins that down.
  await expect(card.getByText('₦650,000', { exact: true })).toHaveCount(2);

  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByText('Spent this month')).toBeVisible();
  await expect(page.getByText('Bulk market run')).toBeVisible();
});
