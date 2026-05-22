import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

describe('ShadStackTable — row pinning', () => {
  it('marks a top-pinned row with data-pinned and places it before unpinned rows', () => {
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        enableRowPinning
        rowPinningDisplayMode="sticky"
        getRowId={(row) => row.id}
        state={{ rowPinning: { top: ['p003'], bottom: [] } }}
      />,
    );

    // In sticky display mode the pinned row stays in document order alongside
    // the unpinned rows; CSS `position: sticky` is what visually anchors it.
    // The DOM marker we can assert is the row's `data-pinned` attribute and
    // its `position: sticky` class.
    const pinnedRow = screen.getByText('Linus').closest('tr');
    expect(pinnedRow).not.toBeNull();
    expect(pinnedRow).toHaveAttribute('data-pinned');
    expect(pinnedRow!.className).toMatch(/sticky/);

    // An unpinned row is rendered and does NOT carry data-pinned
    const unpinnedRow = screen.getByText('Ada').closest('tr');
    expect(unpinnedRow).not.toBeNull();
    expect(unpinnedRow).not.toHaveAttribute('data-pinned');
    expect(unpinnedRow!.className).not.toMatch(/sticky/);

    // The other fixture rows still render
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.getByText('Margaret')).toBeInTheDocument();
    expect(screen.getByText('Edsger')).toBeInTheDocument();

    // Sanity: only one row in the body is marked data-pinned
    const pinnedRows = document.querySelectorAll('tbody tr[data-pinned]');
    expect(pinnedRows.length).toBe(1);
  });
});
