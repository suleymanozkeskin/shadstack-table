import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_DensityState } from '../types';
import { people, personColumns } from './fixtures';

function Harness({ initialDensity }: { initialDensity: SST_DensityState }) {
  const [density, setDensity] = useState<SST_DensityState>(initialDensity);
  return (
    <>
      <ShadStackTable
        columns={personColumns}
        data={people.slice(0, 2)}
        state={{ density }}
        onDensityChange={setDensity}
      />
      <div data-testid="density">{density}</div>
    </>
  );
}

describe('ShadStackTable — density toggle', () => {
  it('cycles density on toggle button click', async () => {
    const user = userEvent.setup();
    render(<Harness initialDensity="comfortable" />);

    expect(screen.getByTestId('density')).toHaveTextContent('comfortable');

    const toggle = screen.getByRole('button', { name: /toggle density/i });

    // comfortable -> compact
    await user.click(toggle);
    expect(screen.getByTestId('density')).toHaveTextContent('compact');

    // compact -> spacious
    await user.click(toggle);
    expect(screen.getByTestId('density')).toHaveTextContent('spacious');

    // spacious -> comfortable
    await user.click(toggle);
    expect(screen.getByTestId('density')).toHaveTextContent('comfortable');
  });
});
