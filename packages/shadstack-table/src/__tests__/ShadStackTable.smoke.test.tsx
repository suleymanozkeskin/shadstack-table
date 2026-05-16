import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

describe('ShadStackTable — smoke', () => {
  it('renders rows and cells from data', () => {
    render(<ShadStackTable columns={personColumns} data={people.slice(0, 3)} />);

    // Header cells
    expect(screen.getByText('First name')).toBeInTheDocument();
    expect(screen.getByText('Last name')).toBeInTheDocument();

    // Body cells — all 6 (3 rows × 2 cols)
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.getByText('Hopper')).toBeInTheDocument();
    expect(screen.getByText('Linus')).toBeInTheDocument();
    expect(screen.getByText('Torvalds')).toBeInTheDocument();
  });
});
