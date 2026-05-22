import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// WCAG 2.1 A + AA scope — see comment in a11y-basic-table.test.tsx for the
// rationale behind the disabled Radix focus-guard rule.
const axeOptions = {
  runOnly: {
    type: 'tag' as const,
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },
  rules: {
    'aria-hidden-focus': { enabled: false },
  },
};

describe('ShadStackTable — a11y (edit modal)', () => {
  it('has no axe violations once the edit modal is open', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        enableEditing
        editDisplayMode="modal"
        getRowId={(row) => row.id}
      />,
    );

    const editButtons = screen.getAllByRole('button', { name: /^edit$/i });
    await user.click(editButtons[0]);

    // Wait for the dialog to mount before auditing.
    await screen.findByRole('dialog');

    // Radix Dialog renders via portal at document.body.
    const results = await axe(document.body, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
