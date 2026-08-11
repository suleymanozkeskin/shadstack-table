import { expect, test } from '@playwright/test';

/**
 * The inputs the library renders — global search, column filters — read their
 * background from `--sst-input-bg`, defaulting to shadcn's own values. A host
 * whose form controls paint a solid field colour sets that one variable rather
 * than out-specifying each slot, in each colour mode.
 *
 * Only a real browser can check this: the assertion is on computed
 * `background-color` after the cascade, which needs the consumer's Tailwind
 * build to have emitted the arbitrary-value class in the first place.
 */

const HOST_FIELD = 'rgb(12, 34, 56)';

test.describe('input background variable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('table tbody').getByText('Ada Lovelace', { exact: true }),
    ).toBeVisible();
  });

  test('setting --sst-input-bg once repaints every library input', async ({ page }) => {
    const search = page.getByPlaceholder('Search');
    await expect(search).toBeVisible();

    const before = await search.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.addStyleTag({ content: `:root { --sst-input-bg: ${HOST_FIELD}; }` });

    await expect
      .poll(() => search.evaluate((el) => getComputedStyle(el).backgroundColor))
      .toBe(HOST_FIELD);
    expect(before).not.toBe(HOST_FIELD);

    // Every input rendered through the library's primitive picks it up from
    // the same declaration — that is the point of routing through a variable
    // instead of a per-slot class.
    const painted = await page
      .locator('input[data-slot="input"]:visible')
      .evaluateAll((nodes) => nodes.map((el) => getComputedStyle(el).backgroundColor));

    expect(painted.length).toBeGreaterThan(0);
    expect(painted.every((color) => color === HOST_FIELD)).toBe(true);
  });
});
