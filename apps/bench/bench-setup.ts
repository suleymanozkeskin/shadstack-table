// Mirrors packages/shadstack-table/test-setup.ts: happy-dom lacks
// IntersectionObserver and ResizeObserver, and the virtualization +
// Radix-driven code paths touch both. No-op stubs are sufficient for
// render benchmarks — we're measuring render cost, not observer behavior.

// React 18+ requires this flag for `act` to be enabled. Without it every
// `act(...)` call logs a noisy warning about the testing environment not
// being configured — the renders still happen, but the bench output gets
// drowned in warnings.
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
  value: true,
  configurable: true,
  writable: true,
});

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

class ResizeObserverMock implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverMock;
}
