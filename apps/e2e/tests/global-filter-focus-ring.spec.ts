import { expect, test } from '@playwright/test';

/**
 * The global-search field lives inside a Collapsible whose content is
 * `overflow-hidden` — that clip is what makes the collapse animation work, and
 * it also clips whatever the input paints outside its border box. The
 * `focus-visible` ring is drawn as a 3px box-shadow beyond that box, so
 * without space reserved inside the clip the focused field renders with
 * cut-off corners.
 *
 * This is a geometry invariant, not a class-name one: the input must sit at
 * least a ring's width inside its clipping ancestor on every edge. jsdom has
 * no layout, so it can only be checked in a real browser.
 */

// _ui/input.tsx: `focus-visible:ring-[3px]`.
const RING_WIDTH = 3;

test.describe('global filter focus ring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('table tbody').getByText('Ada Lovelace', { exact: true }),
    ).toBeVisible();
  });

  test('the focused search field clears its clipping ancestor on every edge', async ({ page }) => {
    const search = page.getByPlaceholder('Search');
    const clip = page.locator('[data-slot="sst-global-filter"]');

    await search.focus();
    await expect(search).toBeFocused();

    const input = (await search.boundingBox())!;
    const container = (await clip.boundingBox())!;

    expect(input.x - container.x).toBeGreaterThanOrEqual(RING_WIDTH);
    expect(input.y - container.y).toBeGreaterThanOrEqual(RING_WIDTH);
    expect(container.x + container.width - (input.x + input.width)).toBeGreaterThanOrEqual(
      RING_WIDTH,
    );
    expect(container.y + container.height - (input.y + input.height)).toBeGreaterThanOrEqual(
      RING_WIDTH,
    );
  });

  test('the container still clips, and the reserved space costs no layout', async ({ page }) => {
    const clip = page.locator('[data-slot="sst-global-filter"]');

    const style = await clip.evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        overflow: computed.overflow,
        paddingLeft: parseFloat(computed.paddingLeft),
        paddingTop: parseFloat(computed.paddingTop),
        marginLeft: parseFloat(computed.marginLeft),
        marginTop: parseFloat(computed.marginTop),
      };
    });

    // Reserving the space by dropping the clip would break the collapse
    // animation instead of fixing the ring.
    expect(style.overflow).toBe('hidden');

    // Padding buys room for the ring; the negative margin gives the same
    // amount back to the layout. They only work as a pair.
    expect(style.paddingLeft).toBeGreaterThanOrEqual(RING_WIDTH);
    expect(style.marginLeft).toBe(-style.paddingLeft);
    expect(style.marginTop).toBe(-style.paddingTop);
  });
});
