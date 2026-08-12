import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumnsWithAge } from './fixtures';

describe('ShadStackTable — column pinning', () => {
  it('pins a column to the left with sticky positioning and data-pinned marker', () => {
    render(
      <ShadStackTable
        columns={personColumnsWithAge}
        data={people}
        enableColumnPinning
        state={{ columnPinning: { start: ['firstName'], end: [] } }}
      />,
    );

    // Header cell renders for the pinned column
    const firstNameHeader = screen.getByRole('columnheader', { name: /first name/i });
    expect(firstNameHeader).toBeInTheDocument();

    // The <th> exposes data-pinned and inline position: sticky
    expect(firstNameHeader.tagName).toBe('TH');
    expect(firstNameHeader).toHaveAttribute('data-pinned');
    expect(firstNameHeader.style.position).toBe('sticky');
    // Start-pinned columns receive an inline logical inset offset — a px value,
    // not blank. The offset is logical (`inset-inline-start`) rather than
    // physical `left` so it stays correct under `dir="rtl"`.
    expect(firstNameHeader.style.insetInlineStart).not.toBe('');

    // The unpinned column header should NOT be pinned
    const lastNameHeader = screen.getByRole('columnheader', { name: /last name/i });
    expect(lastNameHeader).not.toHaveAttribute('data-pinned');
    expect(lastNameHeader.style.position).not.toBe('sticky');
  });

  it('pins a column to the right and sets the right offset', () => {
    render(
      <ShadStackTable
        columns={personColumnsWithAge}
        data={people}
        enableColumnPinning
        state={{ columnPinning: { start: [], end: ['age'] } }}
      />,
    );

    const ageHeader = screen.getByRole('columnheader', { name: /age/i });
    expect(ageHeader).toHaveAttribute('data-pinned');
    expect(ageHeader.style.position).toBe('sticky');
    // End-pinned columns receive an inline-end offset, not an inline-start one
    expect(ageHeader.style.insetInlineEnd).not.toBe('');
    expect(ageHeader.style.insetInlineStart).toBe('');
  });
});
