/// <reference types="@testing-library/jest-dom" />

// Re-imports the runtime extension so tsc picks up the type augmentation
// applied to Vitest's `expect`. The actual matcher registration happens in
// test-setup.ts at runtime via vitest.config.ts.
// oxlint-disable-next-line no-unassigned-import -- side-effect import: extends Vitest's expect with jest-dom matchers (type-only)
import '@testing-library/jest-dom/vitest';
