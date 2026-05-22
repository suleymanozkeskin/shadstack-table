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

// PR #51's helper exposes three `source` values: 'button', 'keyboard',
// 'cell-menu'. The first test file covered 'button'; the two suites below
// exercise the keyboard and cell-action-menu paths so a future refactor
// can't silently break those fire-and-forget call sites.

// happy-dom reports `navigator.platform = ''`, but the keyboard handler
// gates clipboard writes on a Mac/Win platform check. Stubbing platform to
// 'MacIntel' lets the metaKey branch fire without changing prod code.
const installPlatform = (value: string) => {
  const original = Object.getOwnPropertyDescriptor(globalThis.navigator, 'platform');
  Object.defineProperty(globalThis.navigator, 'platform', { configurable: true, value });
  return () => {
    if (original) Object.defineProperty(globalThis.navigator, 'platform', original);
  };
};

describe('clipboard — keyboard (Cmd/Ctrl+C on focused cell)', () => {
  let restorePlatform: () => void;

  afterEach(() => {
    restoreClipboard();
    restorePlatform?.();
  });

  it('copies the cell value when the cell is focused and Cmd+C is pressed', async () => {
    restorePlatform = installPlatform('MacIntel');

    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);

    render(<ShadStackTable columns={columnsWithCopy} data={people.slice(0, 1)} />);

    // SST_TableBodyCell exposes the keyboard handler on the <td> when
    // enableKeyboardShortcuts is true (default). The cell with "Ada" is the
    // firstName column — pick its <td> by text and walk up.
    const adaCell = screen.getByText('Ada').closest('td')!;
    adaCell.focus();

    fireEvent.keyDown(adaCell, { key: 'c', metaKey: true });

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    expect(writeText).toHaveBeenCalledWith('Ada');
  });

  it('routes Clipboard API absence through onCopyError with source: keyboard', async () => {
    restorePlatform = installPlatform('MacIntel');
    installClipboard(undefined);

    const onCopyError = vi.fn();
    render(
      <ShadStackTable
        columns={columnsWithCopy}
        data={people.slice(0, 1)}
        onCopyError={onCopyError}
      />,
    );

    const adaCell = screen.getByText('Ada').closest('td')!;
    adaCell.focus();
    fireEvent.keyDown(adaCell, { key: 'c', metaKey: true });

    await waitFor(() => {
      expect(onCopyError).toHaveBeenCalledTimes(1);
    });
    const [, context] = onCopyError.mock.calls[0];
    expect(context).toMatchObject({ value: 'Ada', source: 'keyboard' });
    expect(context.cell).toBeDefined();
  });
});

// The cell-action-menu Copy item only renders when enableClickToCopy is
// 'context-menu' (a tri-state: true → cell-level click-to-copy, 'context-menu'
// → menu Copy item, false → off). Use a dedicated column shape so the menu
// has at least one internal item to render — without it the menu returns
// null and our queries never resolve.
const columnsWithMenuCopy: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name', enableClickToCopy: 'context-menu' },
  { accessorKey: 'lastName', header: 'Last name' },
];

describe('clipboard — cell-action-menu Copy item', () => {
  afterEach(() => {
    restoreClipboard();
  });

  it('copies the cell value when the menu Copy item is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);

    render(
      <ShadStackTable columns={columnsWithMenuCopy} data={people.slice(0, 1)} enableCellActions />,
    );

    const adaCell = screen.getByText('Ada').closest('td')!;
    // Right-click sets the actionCell and opens the SST_CellActionMenu.
    fireEvent.contextMenu(adaCell);

    // The "Copy" item carries localization.copy as its label.
    // SST_ActionMenuItem renders <button>label</button>, so the menu Copy
    // item is queryable as role=button with the localized "Copy" label.
    const copyItem = await screen.findByRole('button', { name: /^copy$/i });
    fireEvent.click(copyItem);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    expect(writeText).toHaveBeenCalledWith('Ada');
  });

  it('routes Clipboard API absence through onCopyError with source: cell-menu', async () => {
    installClipboard(undefined);

    const onCopyError = vi.fn();
    render(
      <ShadStackTable
        columns={columnsWithMenuCopy}
        data={people.slice(0, 1)}
        enableCellActions
        onCopyError={onCopyError}
      />,
    );

    const adaCell = screen.getByText('Ada').closest('td')!;
    fireEvent.contextMenu(adaCell);

    // SST_ActionMenuItem renders <button>label</button>, so the menu Copy
    // item is queryable as role=button with the localized "Copy" label.
    const copyItem = await screen.findByRole('button', { name: /^copy$/i });
    fireEvent.click(copyItem);

    await waitFor(() => {
      expect(onCopyError).toHaveBeenCalledTimes(1);
    });
    const [, context] = onCopyError.mock.calls[0];
    expect(context).toMatchObject({ value: 'Ada', source: 'cell-menu' });
    expect(context.cell).toBeDefined();
  });
});
