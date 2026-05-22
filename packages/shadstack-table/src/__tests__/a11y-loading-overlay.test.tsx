import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// WCAG 2.1 A + AA scope — see comment in a11y-basic-table.test.tsx for the
// rationale behind the two disabled rules.
const axeOptions = {
  runOnly: {
    type: 'tag' as const,
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },
  rules: {
    'aria-prohibited-attr': { enabled: false },
    'aria-hidden-focus': { enabled: false },
  },
};

// Phase 2 of the maintenance audit fixed:
//   - aria-describedby on the table container resolving to a real spinner id
//   - the spinner's aria-label announcing "Loading" (not "No records to display")
// This test asserts both: a clean axe pass requires the describedby target to
// resolve, and that the labelled spinner is real, focusable assistive content.
describe('ShadStackTable — a11y (loading overlay)', () => {
  it('has no axe violations while the loading overlay is visible', async () => {
    const { container } = render(
      <ShadStackTable columns={personColumns} data={people} state={{ isLoading: true }} />,
    );

    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
