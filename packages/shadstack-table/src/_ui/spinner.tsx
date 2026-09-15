import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

function Spinner({
  className,
  size,
  ...props
}: React.ComponentProps<'output'> & { size?: number | string }) {
  return (
    <output
      data-slot="spinner"
      aria-label="Loading"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <Loader2 className="animate-spin" style={size ? { width: size, height: size } : undefined} />
    </output>
  );
}

export { Spinner };
