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
        state={{ columnPinning: { left: ['firstName'], right: [] } }}
      />,
    );

    // Header cell renders for the pinned column
    const firstNameHeader = screen.getByRole('columnheader', { name: /first name/i });
    expect(firstNameHeader).toBeInTheDocument();

    // The <th> exposes data-pinned and inline position: sticky
    expect(firstNameHeader.tagName).toBe('TH');
    expect(firstNameHeader).toHaveAttribute('data-pinned');
    expect(firstNameHeader.style.position).toBe('sticky');
    // Left-pinned columns receive an inline `left` offset (start) — should be a px value, not blank
    expect(firstNameHeader.style.left).not.toBe('');

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
        state={{ columnPinning: { left: [], right: ['age'] } }}
      />,
    );

    const ageHeader = screen.getByRole('columnheader', { name: /age/i });
    expect(ageHeader).toHaveAttribute('data-pinned');
    expect(ageHeader.style.position).toBe('sticky');
    // Right-pinned columns receive an inline `right` offset, not `left`
    expect(ageHeader.style.right).not.toBe('');
    expect(ageHeader.style.left).toBe('');
  });
});
