import * as React from 'react';
import { cn } from '../lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Diverges from stock shadcn in one place: the two background
        // declarations read `--sst-input-bg`, defaulting to shadcn's own values
        // (`bg-transparent` light, `bg-input/30` dark). A host whose form
        // controls paint a solid field colour sets that variable once instead
        // of out-specifying `searchInput` and `filterInput` separately, per
        // colour mode. Fallbacks are inline rather than in styles.css so this
        // holds for consumers who never import the stylesheet.
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-[var(--sst-input-bg,color-mix(in_oklab,var(--input)_30%,transparent))] border-input flex h-9 w-full min-w-0 rounded-md border bg-[var(--sst-input-bg,transparent)] px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
