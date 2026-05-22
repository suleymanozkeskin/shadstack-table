import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// PR #42 converted the sort indicator from <span> to <button type="button">.
// The PR's manual smoke noted Enter/Space cycling sort, but no automated test
// asserted the native button keyboard activation actually drives the sort
// state. This file fills that gap — both keys must cycle asc → desc → none.

describe('SST_TableHeadCellSortLabel — keyboard activation', () => {
  it('cycles sort state with Enter (asc → desc → unsorted)', async () => {
    const user = userEvent.setup();

    render(<ShadStackTable columns={personColumns} data={people} enableSorting />);

    const firstNameHeader = screen.getByRole('columnheader', { name: /first name/i });
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'none');

    // The sort indicator inside the header is a real <button> after PR #42.
    // It carries the dynamic localization label as aria-label
    // (e.g. "Sort by First name in ascending order").
    const sortButton = screen.getByRole('button', { name: /sort by first name/i });
    sortButton.focus();
    expect(sortButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'ascending');

    await user.keyboard('{Enter}');
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'descending');

    await user.keyboard('{Enter}');
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'none');
  });

  it('cycles sort state with Space (asc → desc → unsorted)', async () => {
    const user = userEvent.setup();

    render(<ShadStackTable columns={personColumns} data={people} enableSorting />);

    const firstNameHeader = screen.getByRole('columnheader', { name: /first name/i });
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'none');

    const sortButton = screen.getByRole('button', { name: /sort by first name/i });
    sortButton.focus();

    // Space is the second native button activation key; verify both work
    // independently. Some keyboard users prefer Space on toggle buttons.
    await user.keyboard(' ');
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'ascending');

    await user.keyboard(' ');
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'descending');

    await user.keyboard(' ');
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'none');
  });
});
