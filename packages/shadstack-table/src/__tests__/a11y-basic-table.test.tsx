import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// Axe smoke for the baseline ShadStackTable render. WCAG 2.1 A + AA only —
// the "best-practice" rule set carries noise that's not actionable for a
// library at this layer (e.g. region landmarks on isolated component renders).
//
// One rule stays disabled at the suite level:
//   - aria-hidden-focus: Radix Popover/Dialog inject focus-guard <span>s with
//     tabindex="0" + aria-hidden="true". This is upstream Radix behavior and
//     a widely-acknowledged axe false positive for that pattern.
//
// (aria-prohibited-attr was previously disabled for SST_TableHeadCellSortLabel
// — the interactive <span> was converted to a <button> in the 0.2.0 cycle, so
// the rule runs again on every render.)
const axeOptions = {
  runOnly: {
    type: 'tag' as const,
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },
  rules: {
    'aria-hidden-focus': { enabled: false },
  },
};

describe('ShadStackTable — a11y (basic render)', () => {
  it('has no axe violations with default options', async () => {
    const { container } = render(
      <ShadStackTable columns={personColumns} data={people.slice(0, 3)} />,
    );

    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
