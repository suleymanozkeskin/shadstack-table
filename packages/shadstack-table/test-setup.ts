// oxlint-disable-next-line no-unassigned-import -- side-effect import: extends Vitest's expect with jest-dom matchers
import '@testing-library/jest-dom/vitest';
// oxlint-disable-next-line no-unassigned-import -- side-effect import: extends Vitest's expect with vitest-axe matchers (toHaveNoViolations)
import 'vitest-axe/extend-expect';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// happy-dom lacks IntersectionObserver — SST_* virtualization paths
// touch it indirectly. A no-op stub is enough for unit tests; the real
// virtualization behavior belongs in a Playwright pass.
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;
}

// happy-dom lacks ResizeObserver — needed by Radix popovers/menus used in
// column-actions, density toggle, and filter menus.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
