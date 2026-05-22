import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

describe('ShadStackTable — RTL pagination chevrons', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('dir', 'rtl');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  it('flips pagination chevron transforms with scaleX(-1) when documentElement is RTL', async () => {
    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        initialState={{ pagination: { pageIndex: 0, pageSize: 2 } }}
      />,
    );

    // useDirection runs in an effect after mount, so wait for the flipped
    // transform to land on the chevron icons.
    const prevButton = await screen.findByRole('button', { name: /go to previous page/i });
    const nextButton = await screen.findByRole('button', { name: /go to next page/i });

    await waitFor(() => {
      const prevIcon = prevButton.querySelector('svg');
      const nextIcon = nextButton.querySelector('svg');
      expect(prevIcon).not.toBeNull();
      expect(nextIcon).not.toBeNull();
      expect(prevIcon!.style.transform).toBe('scaleX(-1)');
      expect(nextIcon!.style.transform).toBe('scaleX(-1)');
    });
  });

  it('leaves pagination chevrons unflipped under LTR (baseline)', async () => {
    // Override the beforeEach's RTL setup for this one test
    document.documentElement.removeAttribute('dir');

    render(
      <ShadStackTable
        columns={personColumns}
        data={people}
        initialState={{ pagination: { pageIndex: 0, pageSize: 2 } }}
      />,
    );

    const nextButton = await screen.findByRole('button', { name: /go to next page/i });
    const nextIcon = nextButton.querySelector('svg');
    expect(nextIcon).not.toBeNull();
    // No inline transform should be applied under LTR
    expect(nextIcon!.style.transform).toBe('');
  });
});
