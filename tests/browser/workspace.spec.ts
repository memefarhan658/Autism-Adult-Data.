import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('overview charts drill through to the records behind a score', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Research overview' })).toBeVisible();
  await expect(page.locator('.metric-card')).toHaveCount(4);
  await page.getByRole('button', { name: '%', exact: true }).click();
  await expect(page.getByRole('button', { name: '%', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('link', { name: /^Explore score 4:/ }).click();
  await expect(page).toHaveURL(/#\/explorer\?score=4$/);
  await expect(page.locator('.count-tag')).toHaveText('131 of 704');
  await expect(page.getByRole('combobox', { name: 'AQ-10 score' })).toHaveValue('4');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Research overview' })).toBeVisible();
});

test('inspect a record, keep filters on reload, and download just that cohort', async ({
  page,
}, info) => {
  await page.goto('./#/explorer');
  await page.getByRole('textbox', { name: 'Search records' }).fill('sa-0001');
  await expect(page.locator('.count-tag')).toHaveText('1 of 704');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Search records' })).toHaveValue('sa-0001');
  const trigger = page.getByRole('button', { name: 'SA-0001', exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Record details' })).toBeVisible();
  await expect(page.locator('.bits-grid > div')).toHaveCount(10);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloading;
  const path = info.outputPath(download.suggestedFilename());
  await download.saveAs(path);
  const data = await readFile(path, 'utf8');
  expect(data.trim().split('\r\n')).toHaveLength(2);
  expect(data).toContain('SA-0001');
  expect(data).not.toContain('SA-0002');
});

test('empty states recover, pagination works, and numeric sorting is not lexical', async ({
  page,
}) => {
  await page.goto('./#/explorer?score=0&label=YES');
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.count-tag')).toHaveText('704 of 704');
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.locator('tbody tr').first()).toContainText('SA-0011');
  const sort = page.getByRole('button', { name: 'AQ-10 score', exact: true });
  await sort.click();
  await expect(page.locator('.score-cell b').first()).toHaveText('0');
  await sort.click();
  await expect(page.locator('.score-cell b').first()).toHaveText('10');
  await expect(page.getByRole('button', { name: 'Previous page' })).toBeDisabled();
});

test('age-band analysis recomputes figures and preserves the cohort during drill-down', async ({
  page,
}, info) => {
  await page.goto('./#/analysis');
  await page.getByRole('combobox', { name: 'Focus by age' }).selectOption('Unknown');
  await expect(page.locator('.donut-center strong')).toHaveText('3');
  await expect(page.locator('.item-row')).toHaveCount(10);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export summary' }).click();
  const download = await downloading;
  const path = info.outputPath(download.suggestedFilename());
  await download.saveAs(path);
  expect(await readFile(path, 'utf8')).toContain('"Cohort","Age band: Unknown"');
  await page
    .getByRole('link', { name: /^Explore score \d+: [1-9]/ })
    .first()
    .click();
  await expect(page.getByRole('combobox', { name: 'Age band', exact: true })).toHaveValue(
    'Unknown',
  );
  await expect(page.locator('tbody tr').first()).toContainText('Unknown');
});

test('field reference supports search and recovery', async ({ page }) => {
  await page.goto('./#/dictionary');
  await page.getByRole('button', { name: 'Questionnaire', exact: true }).click();
  await expect(page.locator('.field-row')).toHaveCount(10);
  const search = page.getByRole('textbox', { name: 'Search fields' });
  await search.fill('A10_Score');
  await expect(page.locator('.field-row')).toHaveCount(1);
  await search.fill('absent example');
  await page.getByRole('button', { name: 'Show all fields' }).click();
  await expect(page.locator('.field-row')).toHaveCount(15);
});

test('mobile navigation has a closeable drawer and no page-level horizontal overflow', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const drawer = page.getByRole('dialog', { name: 'Navigation' });
  await expect(drawer).toBeVisible();
  await drawer.getByRole('link', { name: 'Data explorer', exact: true }).click();
  await expect(drawer).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Data explorer' })).toBeVisible();
  for (const route of ['overview', 'explorer', 'analysis', 'dictionary', 'methodology']) {
    await page.goto(`./#/${route}`);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
