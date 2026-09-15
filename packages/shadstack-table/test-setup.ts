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
class IntersectionObserverMock implements IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  root = null;
  rootMargin = '';
  scrollMargin = '';
  delay = 0;
  trackVisibility = false;
  thresholds = [];
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = IntersectionObserverMock;
}

// happy-dom lacks ResizeObserver — needed by Radix popovers/menus used in
// column-actions, density toggle, and filter menus.
class ResizeObserverMock implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverMock;
}
