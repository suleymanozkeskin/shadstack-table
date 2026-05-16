import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

describe('ShadStackTable — pagination', () => {
  it('shows only the current page of rows and advances on next-page click', async () => {
    const user = userEvent.setup();
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        initialState={{ pagination: { pageIndex: 0, pageSize: 2 } }}
      />,
    );

    // 5 rows in fixture, pageSize 2 → page 1 shows rows 1–2 only (Ada, Grace)
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.queryByText('Linus')).not.toBeInTheDocument();
    expect(screen.queryByText('Margaret')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /go to next page/i }));

    // Page 2 shows rows 3–4 (Linus, Margaret)
    expect(screen.getByText('Linus')).toBeInTheDocument();
    expect(screen.getByText('Margaret')).toBeInTheDocument();
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    expect(screen.queryByText('Grace')).not.toBeInTheDocument();
  });
});
