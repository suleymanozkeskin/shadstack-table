import * as React from 'react';
import { format } from 'date-fns';
import { Button } from '../../_ui/button';
import { Calendar } from '../../_ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../_ui/popover';
import { cn } from '../../lib/utils';

function coerceDate(v: Date | number | string | null | undefined): Date | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? undefined : v;
  const parsed = new Date(v);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export interface SST_DateFilterProps {
  ariaLabel?: string;
  calendarIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  inputRef?: (el: HTMLButtonElement | null) => void;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  title?: string;
  value: Date | number | string | null | undefined;
}

export const SST_DateFilter = ({
  ariaLabel,
  calendarIcon,
  className,
  disabled,
  inputRef,
  onChange,
  placeholder,
  title,
  value,
}: SST_DateFilterProps) => {
  const [open, setOpen] = React.useState(false);
  const date = coerceDate(value);
  const label = date ? format(date, 'PP') : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={inputRef}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!date}
          title={title ?? placeholder}
          aria-label={ariaLabel ?? placeholder}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'h-9 w-full justify-start gap-2 text-left font-normal',
            'data-[empty=true]:text-muted-foreground',
            className,
          )}
        >
          {calendarIcon}
          <span className="truncate">{label || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ?? undefined);
            if (d) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
