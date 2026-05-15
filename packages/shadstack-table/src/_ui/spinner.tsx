import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

function Spinner({
  className,
  size,
  ...props
}: React.ComponentProps<'span'> & { size?: number | string }) {
  return (
    <span
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <Loader2 className="animate-spin" style={size ? { width: size, height: size } : undefined} />
    </span>
  );
}

export { Spinner };
