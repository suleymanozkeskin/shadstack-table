import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_ColumnDef } from '../types';

type Item = { id: string; firstName: string; lastName: string };

const columns: SST_ColumnDef<Item>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
];

const data: Item[] = Array.from({ length: 200 }, (_, i) => ({
  id: `r${String(i).padStart(3, '0')}`,
  firstName: `First${i}`,
  lastName: `Last${i}`,
}));

describe('ShadStackTable — row virtualization', () => {
  // Note on happy-dom: there is no real layout engine, so the scroll container
  // reports zero dimensions and @tanstack/react-virtual's window collapses to
  // (effectively) no visible rows. That is the OPPOSITE of the production
  // behaviour, but it is still a meaningful inverse-assertion: when
  // virtualization is enabled, far fewer than `data.length` body rows are in
  // the DOM. When it's disabled, all 200 rows materialise. Asserting the gap
  // catches regressions where someone accidentally bypasses the virtualizer.

  it('renders all rows when virtualization is disabled (baseline)', () => {
    const { container } = render(
      <ShadStackTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        initialState={{ density: 'compact', pagination: { pageIndex: 0, pageSize: 200 } }}
      />,
    );

    const bodyRows = container.querySelectorAll('tbody tr');
    expect(bodyRows.length).toBe(200);
  });

  it('renders far fewer than the full dataset when enableRowVirtualization is on', () => {
    const { container } = render(
      <ShadStackTable
        columns={columns}
        data={data}
        enableRowVirtualization
        getRowId={(row) => row.id}
        initialState={{ density: 'compact' }}
      />,
    );

    const bodyRows = container.querySelectorAll('tbody tr');
    // Under a real browser the virtualizer would emit a small windowed slice
    // (overscan + visible). Under happy-dom, with no layout, the windowed
    // count is even smaller. Either way it must be well under the dataset
    // length — pick a deliberately loose bound to stay robust across
    // happy-dom and @tanstack/react-virtual upgrades, while still failing
    // hard if virtualization breaks and we accidentally render all 200.
    expect(bodyRows.length).toBeLessThan(50);
    expect(bodyRows.length).toBeLessThan(data.length);
  });
});
