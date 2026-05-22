import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { people, personColumns } from './fixtures';

// Regression: the loading overlay used to advertise aria-describedby="sst-progress"
// while the spinner was rendered with id="sst-progress-${id}", so screen readers
// couldn't resolve the description. The aria-label was also localization.noRecordsToDisplay,
// announcing "No records to display" during a fetch. Both are fixed; this test pins them.
describe('ShadStackTable — loading overlay accessibility', () => {
  it('aria-describedby on the container points at the spinner id', () => {
    render(<ShadStackTable columns={personColumns} data={people} state={{ isLoading: true }} />);

    const container = document.querySelector('[data-slot="sst-table-container"]');
    expect(container).not.toBeNull();
    const describedBy = container!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).not.toBeNull();
  });

  it('spinner aria-label announces loading, not empty-state copy', () => {
    render(<ShadStackTable columns={personColumns} data={people} state={{ isLoading: true }} />);

    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByLabelText(/no records to display/i)).not.toBeInTheDocument();
  });
});
