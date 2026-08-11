import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_InternalFilterOption } from '../types';
import { people, personColumns } from './fixtures';

describe('ShadStackTable — global filter toggle', () => {
  it('renders the toggle by default', async () => {
    render(<ShadStackTable columns={personColumns} data={people} />);

    expect(await screen.findByRole('button', { name: 'Show/Hide search' })).toBeInTheDocument();
  });

  it('drops the toggle when enableGlobalFilterToggle is false', async () => {
    // Paired with an open initial state, which is the always-visible-search
    // case. The option governs the button only — it does not open the field,
    // since a consumer may be driving `showGlobalFilter` from their own
    // control instead.
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enableGlobalFilterToggle={false}
        initialState={{ showGlobalFilter: true }}
      />,
    );

    expect(await screen.findByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show/Hide search' })).not.toBeInTheDocument();
  });

  it('keeps the toggle when the search starts open', async () => {
    // The toggle used to be mounted only when `initialState.showGlobalFilter`
    // was falsy, which made an initial state value decide whether a control
    // existed at all. The two are independent now.
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        initialState={{ showGlobalFilter: true }}
      />,
    );

    expect(await screen.findByRole('button', { name: 'Show/Hide search' })).toBeInTheDocument();
  });
});

describe('ShadStackTable — filter mode menu dividers', () => {
  const openFilterModeMenu = async (user: ReturnType<typeof userEvent.setup>) => {
    const buttons = await screen.findAllByRole('button', { name: 'Change filter mode' });
    await user.click(buttons[0]!);
  };

  it('separates operator groups by default', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enableColumnFilterModes
        initialState={{ showColumnFilters: true }}
      />,
    );

    await openFilterModeMenu(user);

    const menu = await screen.findByRole('dialog');
    expect(within(menu).getByText('Ends With')).toBeInTheDocument();
    expect(menu.querySelectorAll('[data-slot="separator"]').length).toBeGreaterThan(0);
  });

  it('draws no separators when enableFilterModeMenuDividers is false', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enableColumnFilterModes
        enableFilterModeMenuDividers={false}
        initialState={{ showColumnFilters: true }}
      />,
    );

    await openFilterModeMenu(user);

    const menu = await screen.findByRole('dialog');
    // Same operators, minus the rules between them.
    expect(within(menu).getByText('Ends With')).toBeInTheDocument();
    expect(menu.querySelectorAll('[data-slot="separator"]')).toHaveLength(0);
  });

  it('reaches a custom filter-mode renderer through internalFilterOptions', async () => {
    const user = userEvent.setup();
    let seen: SST_InternalFilterOption[] = [];

    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enableColumnFilterModes
        enableFilterModeMenuDividers={false}
        initialState={{ showColumnFilters: true }}
        renderColumnFilterModeMenuItems={({ internalFilterOptions }) => {
          seen = internalFilterOptions;
          return internalFilterOptions.map((option) => (
            <div key={option.option}>{option.label}</div>
          ));
        }}
      />,
    );

    await openFilterModeMenu(user);
    await screen.findByRole('dialog');

    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((option) => option.divider === false)).toBe(true);
  });
});
