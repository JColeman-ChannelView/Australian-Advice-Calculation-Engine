/**
 * Browser smoke tests against the built UI served by the reference server (run `npm run build` first).
 */
import { expect, test, type Page } from '@playwright/test';

const consoleErrors: string[] = [];
test.beforeEach(({ page }) => {
  consoleErrors.length = 0;
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
});
test.afterEach(() => {
  expect(consoleErrors, 'no console errors').toEqual([]);
});

async function resultValue(page: Page, key: string): Promise<string> {
  return (await page.locator(`[data-testid=result] .kv-row[data-key="${key}"] dd`).first().textContent()) ?? '';
}

test('home shows the personal tax example with the expected result', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('calc-title')).toHaveText('Personal tax summary (resident)');
  await expect(page.getByTestId('status')).toContainText('Calculated');
  expect(await resultValue(page, 'total_payable')).toBe('$20,688.00');
  await expect(page.getByText('Not financial advice')).toBeVisible();
});

test('Age Pension: assets test binds at 433,000 → $937.70 a fortnight', async ({ page }) => {
  await page.goto('/#/calc/centrelink.age_pension');
  await page.getByTestId('in.assessable_assets').fill('433000');
  await page.getByTestId('in.financial_assets').fill('0');
  await page.getByTestId('calculate').click();
  expect(await resultValue(page, 'rate_fortnightly_per_person')).toBe('$937.70');
  expect(await resultValue(page, 'assets_cut_off')).toBe('$745,750.00');
  // Sources are shown with the result
  await page.getByText(/Parameters and sources/).click();
  await expect(page.locator('.params a').first()).toHaveAttribute('href', /^https:\/\/(www\.servicesaustralia|guides\.dss|www\.legislation)\.gov\.au/);
});

test('unpublished parameters block instead of estimating', async ({ page }) => {
  await page.goto('/#/calc/tax.medicare_levy');
  await page.getByTestId('in.financial_year').selectOption('2026-27');
  await page.getByTestId('calculate').click();
  await expect(page.getByTestId('status')).toContainText('Blocked');
  await expect(page.getByTestId('blocked')).toContainText('PARAMETER_MISSING');
});

test('invalid input is reported with field paths', async ({ page }) => {
  await page.goto('/#/calc/tax.income_tax');
  await page.getByTestId('in.taxable_income').fill('abc');
  await page.getByTestId('calculate').click();
  await expect(page.getByTestId('status')).toContainText('Invalid');
  await expect(page.getByTestId('issues')).toContainText('taxable_income');
});

test('projection renders a two-series chart and year table', async ({ page }) => {
  await page.goto('/#/calc/projection.super');
  await expect(page.locator('figure.chart svg path.line')).toHaveCount(2);
  await expect(page.getByText(/Rows \(\d+\)/)).toBeVisible();
  await page.locator('figure.chart svg').hover({ position: { x: 200, y: 120 } });
  await expect(page.locator('.tooltip')).toBeVisible();
});

test('aged care Sakura scenario reproduces the official MTA', async ({ page }) => {
  await page.goto('/#/calc/aged_care.residential_fees');
  await page.getByTestId('in.fee_date').fill('2026-04-01');
  await page.getByTestId('in.entry_date').fill('2026-03-25');
  await page.getByTestId('in.price_agreed_date').fill('2026-03-25');
  await page.getByTestId('calculate').click();
  expect(await resultValue(page, 'means_tested_amount')).toBe('$121.33');
  expect(await resultValue(page, 'non_clinical_care_contribution')).toBe('$26.88');
});

test('evidence bundle downloads as JSON', async ({ page }) => {
  await page.goto('/#/calc/tax.income_tax');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('download-evidence').click()]);
  expect(download.suggestedFilename()).toMatch(/^tax\.income_tax-evidence-.*\.json$/);
});

test('parameter register lists sourced records and filters', async ({ page }) => {
  await page.goto('/#/parameters');
  const rows = page.locator('[data-testid=register] tbody tr');
  expect(await rows.count()).toBeGreaterThan(50);
  await page.getByLabel('Filter parameters').fill('deeming');
  expect(await rows.count()).toBeGreaterThanOrEqual(4);
});

test('every calculator page loads its example without invalid input', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('nav a[data-testid^="nav-"]').evaluateAll((as) => as.map((a) => a.getAttribute('data-testid')!.slice(4)).filter((x) => x.includes('.')));
  expect(ids.length).toBeGreaterThanOrEqual(30);
  for (const id of ids) {
    await page.goto(`/#/calc/${id}`);
    await expect(page.getByTestId('result-panel'), id).toBeVisible();
    const status = await page.getByTestId('result-panel').getAttribute('data-status');
    expect(['ok', 'blocked'], `${id} example status`).toContain(status);
  }
});

test('mobile: menu toggles and no horizontal page scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#/calc/super.minimum_pension');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('nav#nav')).toBeVisible();
  await page.getByTestId('nav-super.preservation_age').click();
  await expect(page.getByTestId('calc-title')).toHaveText('Preservation age');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
