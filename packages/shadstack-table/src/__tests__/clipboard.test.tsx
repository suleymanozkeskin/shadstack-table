import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShadStackTable } from '../components/ShadStackTable';
import { type SST_ColumnDef } from '../types';
import { people, type Person } from './fixtures';

// Cell-level click-to-copy on `firstName` so `SST_CopyButton` is in the tree.
// The button uses the rendered cell value as its accessible name ("Ada"),
// and carries a `cursor-copy` class on the inner <button>.
const columnsWithCopy: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name', enableClickToCopy: true },
  { accessorKey: 'lastName', header: 'Last name' },
];

// happy-dom's navigator.clipboard isn't a real Clipboard, so we replace it
// per-test and restore the original descriptor (which, in practice, doesn't
// exist on the prototype — but we cover both cases).
const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
  globalThis.navigator,
  'clipboard',
);

const installClipboard = (writeText: ((value: string) => Promise<void>) | undefined) => {
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    configurable: true,
    value: writeText === undefined ? undefined : { writeText },
  });
};

const restoreClipboard = () => {
  if (originalClipboardDescriptor) {
    Object.defineProperty(globalThis.navigator, 'clipboard', originalClipboardDescriptor);
  } else {
    delete (globalThis.navigator as { clipboard?: unknown }).clipboard;
  }
};

// Two top-toolbar buttons advertise themselves with the same accessible name
// as a copied cell value when the value happens to match a label — but here
// "Ada" is unique. We still scope through `getAllByRole(...)[0]` to make
// intent explicit.
const findCopyButton = () => screen.getAllByRole('button', { name: 'Ada' })[0];

describe('clipboard — SST_CopyButton', () => {
  afterEach(() => {
    restoreClipboard();
  });

  it('writes the cell value to the clipboard on success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);

    render(<ShadStackTable columns={columnsWithCopy} data={people.slice(0, 1)} />);

    fireEvent.click(findCopyButton());

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    expect(writeText).toHaveBeenCalledWith('Ada');
  });

  it('invokes onCopyError with the right context on rejection', async () => {
    const failure = new Error('NotAllowedError: write denied');
    const writeText = vi.fn().mockRejectedValue(failure);
    installClipboard(writeText);

    const onCopyError = vi.fn();
    render(
      <ShadStackTable
        columns={columnsWithCopy}
        data={people.slice(0, 1)}
        onCopyError={onCopyError}
      />,
    );

    fireEvent.click(findCopyButton());

    await waitFor(() => {
      expect(onCopyError).toHaveBeenCalledTimes(1);
    });

    const [error, context] = onCopyError.mock.calls[0];
    expect(error).toBe(failure);
    expect(context).toMatchObject({ value: 'Ada', source: 'button' });
    expect(context.cell).toBeDefined();

    // Success-only tooltip text must not appear on a failed copy.
    expect(screen.queryByText('Copied to clipboard')).not.toBeInTheDocument();
  });

  it('reports onCopyError when the Clipboard API is absent', async () => {
    installClipboard(undefined);

    const onCopyError = vi.fn();
    render(
      <ShadStackTable
        columns={columnsWithCopy}
        data={people.slice(0, 1)}
        onCopyError={onCopyError}
      />,
    );

    fireEvent.click(findCopyButton());

    await waitFor(() => {
      expect(onCopyError).toHaveBeenCalledTimes(1);
    });
    const [error, context] = onCopyError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toMatch(/Clipboard API unavailable/);
    expect(context).toMatchObject({ value: 'Ada', source: 'button' });
  });
});
