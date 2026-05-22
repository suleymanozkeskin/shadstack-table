import { expect, test } from '@playwright/test';

/**
 * Phase 4 smoke coverage: drive the playground's advanced demo with a real
 * browser. We pin to the advanced example (30 employees, pageSize 10) which
 * is the playground default, so we can exercise sort, global filter, and
 * pagination without changing the page state up front.
 *
 * Selector strategy: the advanced demo enables `renderDetailPanel`, which
 * inserts a sibling `<tr class="SST-TableBodyCell-DetailPanel">` after every
 * data row. So `tr[data-index]` would resolve to 2x the row count. We exclude
 * detail-panel rows via `:not(.SST-TableBodyCell-DetailPanel)`.
 *
 * The header text reads "Name" but the columnheader's accessible name also
 * includes "Sort by Name ascending", "Move", "Column Actions", etc. — so we
 * click the dedicated sort-label span exposed with
 * aria-label="Sort by Name ascending".
 */

const ROWS_SELECTOR = 'table tbody tr[data-index]:not(.SST-TableBodyCell-DetailPanel)';
// Default page-1 anchor: Ada is the first row in employees.ts.
const FIRST_PAGE_ROW = 'Ada Lovelace';
// Default page-2 anchor: Radia is index 10 in employees.ts (e011),
// which makes her the first row of page 2 with pageSize=10.
const SECOND_PAGE_ROW = 'Radia Perlman';

test.describe('playground smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait until the first employee row has rendered. Use Ada specifically
    // so we know the table populated with the expected default ordering.
    await expect(
      page.locator('table tbody').getByText(FIRST_PAGE_ROW, { exact: true }),
    ).toBeVisible();
  });

  test('loads the advanced example with a populated table', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'shadstack-table' })).toBeVisible();

    // Default pageSize is 10 (see AdvancedExample.tsx). One row per employee
    // after excluding the detail-panel sibling rows.
    await expect(page.locator(ROWS_SELECTOR)).toHaveCount(10);
  });

  test('sorting by a column header reorders rows', async ({ page }) => {
    // The Name column is the first data column in the advanced demo. Anchor
    // on Ada being first under the default (unsorted) order.
    const firstRow = page.locator(ROWS_SELECTOR).first();
    await expect(firstRow).toContainText(FIRST_PAGE_ROW);

    // The Name column's <th> carries data-can-sort + aria-sort. The sort
    // toggle is wired on an inner div (see SST_TableHeadCell.tsx onClick),
    // and clicking the visible label text bubbles up to it. We target the
    // exact "Name" text node so we don't catch "Job Title" or similar.
    const nameHeader = page
      .locator('table thead th[data-can-sort]')
      .filter({ has: page.getByText('Name', { exact: true }) });

    await expect(nameHeader).toHaveAttribute('aria-sort', 'none');

    // First click: ascending. Ada is alphabetically first by first-name too,
    // so the row order doesn't actually change. Click again to flip to desc
    // and force an observable reorder.
    await nameHeader.getByText('Name', { exact: true }).click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    await nameHeader.getByText('Name', { exact: true }).click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');

    // After desc sort, Ada must no longer be on page 1's top row.
    await expect(firstRow).not.toContainText(FIRST_PAGE_ROW);
  });

  test('global filter narrows visible rows', async ({ page }) => {
    const ada = page.locator('table tbody').getByText(FIRST_PAGE_ROW, { exact: true });
    await expect(ada).toBeVisible();

    // The toolbar search input uses the default "Search" placeholder from
    // the en locale (see packages/shadstack-table/src/locales/en.ts).
    const search = page.getByPlaceholder('Search');
    await search.fill('grace');

    // Global filter is debounced (~250ms client-side). Playwright's auto-wait
    // on toBeHidden gives the debounce time to flush without explicit sleeps.
    await expect(ada).toBeHidden();

    // Grace Hopper survives the filter — sanity that the filter is doing
    // something targeted rather than wiping the table.
    await expect(
      page.locator('table tbody').getByText('Grace Hopper', { exact: true }),
    ).toBeVisible();

    // Clear so we leave state clean for other potential tests on the same
    // dev server (reuseExistingServer is on locally).
    await search.fill('');
    await expect(ada).toBeVisible();
  });

  test('pagination next-page button advances the visible rows', async ({ page }) => {
    // Sanity: page 1 leads with Ada.
    await expect(page.locator(ROWS_SELECTOR).first()).toContainText(FIRST_PAGE_ROW);

    await page.getByRole('button', { name: 'Go to next page' }).click();

    // Page 2 leads with Radia (index 10 of employees.ts).
    await expect(page.locator(ROWS_SELECTOR).first()).toContainText(SECOND_PAGE_ROW);
    await expect(
      page.locator('table tbody').getByText(FIRST_PAGE_ROW, { exact: true }),
    ).toBeHidden();

    // Leave clean state for re-runs.
    await page.getByRole('button', { name: 'Go to previous page' }).click();
    await expect(page.locator(ROWS_SELECTOR).first()).toContainText(FIRST_PAGE_ROW);
  });
});
