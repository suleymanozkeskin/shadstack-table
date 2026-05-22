import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_ColumnDef } from '../types';
import { type Person, people } from './fixtures';

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

const personColumnsMultiSelect: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  {
    accessorKey: 'lastName',
    header: 'Last name',
    filterVariant: 'multi-select',
    filterSelectOptions: ['Lovelace', 'Hopper', 'Torvalds', 'Hamilton', 'Dijkstra'],
  },
];

describe('ShadStackTable — a11y (multi-select filter popover)', () => {
  it('has no axe violations once the filter popover is open', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumnsMultiSelect}
        data={people}
        initialState={{ showColumnFilters: true }}
      />,
    );

    const trigger = await screen.findByRole('button', { name: /filter by last name/i });
    await user.click(trigger);

    // Confirm the popover content is mounted before auditing.
    await screen.findByRole('checkbox', { name: 'Lovelace' });

    // Popover content renders via portal at document.body — audit the whole body
    // so the popover's listbox and checkboxes are in scope.
    const results = await axe(document.body, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
