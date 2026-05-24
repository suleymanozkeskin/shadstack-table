import {
  Profiler,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ProfilerOnRenderCallback,
  type ReactNode,
} from 'react';
import { Bitcoin, Info, X } from 'lucide-react';
import {
  createRow,
  getCoreRowModel as getTanStackCoreRowModel,
  type Row,
  type RowData,
  type RowModel,
  type Table,
} from '@tanstack/react-table';
import {
  ShadStackTable,
  useShadStackTable,
  type SST_ColumnDef,
  type SST_TableSlotProps,
} from 'shadstack-table';

type MemoMode = 'cells' | 'rows' | 'off';
type CoreMode = 'default' | 'reuse';

type TerminalLevel = {
  id: string;
  bidPrice: number;
  bidTotal: number;
  bidSize: number;
  askSize: number;
  askTotal: number;
  askPrice: number;
  bidDepth: number;
  askDepth: number;
  bidSeq: number;
  askSeq: number;
};

type TapeBar = {
  id: number;
  height: number;
  side: 'ask' | 'bid';
};

type BookState = {
  rows: TerminalLevel[];
  tapeBars: TapeBar[];
};

type PressureState = {
  imbalance: number;
  updatePressure: number;
  weight: number;
};

type CoreCounters = {
  created: number;
  reused: number;
  runs: number;
};

type Stats = {
  coreCreatedPerSecond: number;
  coreReusedPerSecond: number;
  coreRunsPerSecond: number;
  commitsPerSecond: number;
  fps: number;
  maxCommitMs: number;
  meanCommitMs: number;
  updatesPerSecond: number;
};

type MetricInfo = {
  details: string[];
  label: string;
  value: string;
};

const MID_PRICE = 74_647.3;
const TICK_SIZE = 0.1;
const ROW_OPTIONS = [50, 200, 1_000, 5_000] as const;
const RATE_OPTIONS = [15, 30, 60] as const;
const BATCH_OPTIONS = [1, 10, 50, 200] as const;
const MEMO_OPTIONS = ['cells', 'rows', 'off'] as const;
const CORE_OPTIONS = ['default', 'reuse'] as const;
const MAX_SIZE = 6;
const MAX_TOTAL = 16;

const priceFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  useGrouping: false,
});

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const statFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

function seededUnit(n: number) {
  let x = (n * 2_654_435_761) >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 0x1_00_00_00_00;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function nextRandom(seedRef: MutableRefObject<number>) {
  let x = seedRef.current || 0x6d_2b_79_f5;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  seedRef.current = x >>> 0;
  return seedRef.current / 0x1_00_00_00_00;
}

function formatAmount(value: number) {
  return amountFormatter.format(value).replace(/\.?0+$/, '');
}

function makeTapeBars(): TapeBar[] {
  return Array.from({ length: 34 }, (_, i) => ({
    height: 4 + Math.round(seededUnit(i + 411) * 52),
    id: i,
    side: seededUnit(i + 733) > 0.54 ? 'bid' : 'ask',
  }));
}

function makeTerminalRows(rowCount: number): TerminalLevel[] {
  const rows: TerminalLevel[] = new Array(rowCount);
  let bidTotal = 8.2;
  let askTotal = 5.7;

  for (let i = 0; i < rowCount; i++) {
    const bidSize = 0.001 + seededUnit(i + 19) * (i % 11 === 0 ? 1.8 : 0.22);
    const askSize = 0.001 + seededUnit(i + 97) * (i % 13 === 0 ? 1.4 : 0.18);
    bidTotal += bidSize;
    askTotal += askSize;

    rows[i] = {
      id: `level-${i}`,
      bidPrice: MID_PRICE - i * TICK_SIZE,
      bidTotal,
      bidSize,
      askSize,
      askTotal,
      askPrice: MID_PRICE + (i + 1) * TICK_SIZE,
      bidDepth: clamp(bidTotal / MAX_TOTAL, 0.04, 1),
      askDepth: clamp(askTotal / MAX_TOTAL, 0.04, 1),
      bidSeq: 0,
      askSeq: 0,
    };
  }

  return rows;
}

function makeBookState(rowCount: number): BookState {
  return {
    rows: makeTerminalRows(rowCount),
    tapeBars: makeTapeBars(),
  };
}

function updateTerminalRows(
  rows: TerminalLevel[],
  batchSize: number,
  seedRef: MutableRefObject<number>,
  sequenceRef: MutableRefObject<number>,
) {
  if (rows.length === 0) return rows;

  const next = rows.slice();

  for (let i = 0; i < batchSize; i++) {
    const index = Math.floor(nextRandom(seedRef) * next.length);
    const side = nextRandom(seedRef) > 0.5 ? 'bid' : 'ask';
    const current = next[index]!;
    const delta = (nextRandom(seedRef) - 0.46) * 0.26;
    sequenceRef.current += 1;

    if (side === 'bid') {
      const bidSize = clamp(current.bidSize + delta, 0.001, MAX_SIZE);
      const bidTotal = clamp(current.bidTotal + delta * 0.8, 0.001, MAX_TOTAL);
      next[index] = {
        ...current,
        bidDepth: clamp(bidTotal / MAX_TOTAL, 0.04, 1),
        bidSeq: sequenceRef.current,
        bidSize,
        bidTotal,
      };
    } else {
      const askSize = clamp(current.askSize + delta, 0.001, MAX_SIZE);
      const askTotal = clamp(current.askTotal + delta * 0.8, 0.001, MAX_TOTAL);
      next[index] = {
        ...current,
        askDepth: clamp(askTotal / MAX_TOTAL, 0.04, 1),
        askSeq: sequenceRef.current,
        askSize,
        askTotal,
      };
    }
  }

  return next;
}

function advanceTapeBars(
  bars: TapeBar[],
  rows: TerminalLevel[],
  seedRef: MutableRefObject<number>,
  sequence: number,
): TapeBar[] {
  const sampleWindow = Math.min(rows.length, 24);
  const row = sampleWindow ? rows[Math.floor(nextRandom(seedRef) * sampleWindow)] : undefined;
  const bidIsFresher = row ? row.bidSeq >= row.askSeq : true;
  const side = bidIsFresher ? 'bid' : 'ask';
  const size = row ? (bidIsFresher ? row.bidSize : row.askSize) : 0;
  const height = 5 + Math.round(clamp(size / MAX_SIZE, 0.02, 1) * 58);

  return [
    ...bars.slice(1),
    {
      height,
      id: sequence,
      side,
    },
  ];
}

function getPressure(rows: TerminalLevel[]): PressureState {
  if (rows.length === 0) {
    return { imbalance: 0.5, updatePressure: 0.5, weight: 0.5 };
  }

  let bid = 0;
  let ask = 0;
  let recentBid = 0;
  let recentAsk = 0;
  const sampleCount = Math.min(rows.length, 24);

  for (let i = 0; i < sampleCount; i++) {
    const row = rows[i]!;
    bid += row.bidSize;
    ask += row.askSize;
    recentBid = Math.max(recentBid, row.bidSeq);
    recentAsk = Math.max(recentAsk, row.askSeq);
  }

  const total = Math.max(bid + ask, 0.001);
  const recentTotal = Math.max(recentBid + recentAsk, 1);

  return {
    imbalance: clamp(bid / total, 0.08, 0.92),
    updatePressure: clamp(recentAsk / recentTotal, 0.08, 0.92),
    weight: clamp(
      (bid + rows[0]!.bidTotal) / (total + rows[0]!.bidTotal + rows[0]!.askTotal),
      0.08,
      0.92,
    ),
  };
}

function getTapeLabel(bars: TapeBar[]): string {
  let net = 0;
  const start = Math.max(0, bars.length - 12);

  for (let i = start; i < bars.length; i++) {
    const bar = bars[i]!;
    net += (bar.side === 'bid' ? 1 : -1) * bar.height;
  }

  const value = net / 9;
  return `${value >= 0 ? '+' : ''}${value.toFixed(3)}`;
}

function readOption<T extends number | string>(key: string, options: readonly T[], fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const value = new URL(window.location.href).searchParams.get(key);
  const parsed = typeof fallback === 'number' ? Number(value) : value;
  return options.includes(parsed as T) ? (parsed as T) : fallback;
}

function getCountingCoreRowModel<TData extends RowData>(
  countersRef: MutableRefObject<CoreCounters>,
) {
  return (table: Table<TData>) => {
    const getRowModel = getTanStackCoreRowModel<TData>()(table);
    let previousData: TData[] | undefined;

    return () => {
      if (table.options.data !== previousData) {
        countersRef.current.created += table.options.data.length;
        countersRef.current.runs += 1;
        previousData = table.options.data;
      }

      return getRowModel();
    };
  };
}

function getReuseCoreRowModel<TData extends RowData>(countersRef: MutableRefObject<CoreCounters>) {
  return (table: Table<TData>) => {
    let previousData: TData[] | undefined;
    let previousModel: RowModel<TData> | undefined;
    let previousRowsById = new Map<
      string,
      {
        original: TData;
        parentId: string | undefined;
        row: Row<TData>;
        rowIndex: number;
      }
    >();

    return () => {
      const data = table.options.data;
      if (data === previousData && previousModel) return previousModel;

      countersRef.current.runs += 1;
      const nextRowsById = new Map<
        string,
        {
          original: TData;
          parentId: string | undefined;
          row: Row<TData>;
          rowIndex: number;
        }
      >();
      const rowModel: RowModel<TData> = {
        flatRows: [],
        rows: [],
        rowsById: {},
      };

      const accessRows = (
        originalRows: TData[],
        depth = 0,
        parentRow?: Row<TData>,
      ): Row<TData>[] => {
        const rows: Row<TData>[] = [];

        for (let i = 0; i < originalRows.length; i++) {
          const original = originalRows[i]!;
          const id = (table as any)._getRowId(original, i, parentRow) as string;
          const parentId = parentRow?.id;
          const previous = previousRowsById.get(id);
          let row: Row<TData>;

          if (
            previous &&
            previous.original === original &&
            previous.rowIndex === i &&
            previous.parentId === parentId &&
            previous.row.depth === depth
          ) {
            row = previous.row;
            countersRef.current.reused += 1;
          } else {
            row = createRow(table, id, original, i, depth, undefined, parentId);
            countersRef.current.created += 1;
          }

          rowModel.flatRows.push(row);
          rowModel.rowsById[row.id] = row;
          rows.push(row);

          if (table.options.getSubRows) {
            row.originalSubRows = table.options.getSubRows(original, i);
            if (row.originalSubRows?.length) {
              row.subRows = accessRows(row.originalSubRows, depth + 1, row);
            }
          }

          nextRowsById.set(id, {
            original,
            parentId,
            row,
            rowIndex: i,
          });
        }

        return rows;
      };

      rowModel.rows = accessRows(data);
      previousData = data;
      previousModel = rowModel;
      previousRowsById = nextRowsById;

      return rowModel;
    };
  };
}

function getSwitchableCoreRowModel<TData extends RowData>(
  countersRef: MutableRefObject<CoreCounters>,
  coreModeRef: MutableRefObject<CoreMode>,
) {
  return (table: Table<TData>) => {
    const getCountingRowModel = getCountingCoreRowModel<TData>(countersRef)(table);
    const getReuseRowModel = getReuseCoreRowModel<TData>(countersRef)(table);

    return () => (coreModeRef.current === 'reuse' ? getReuseRowModel() : getCountingRowModel());
  };
}

function ControlGroup<T extends number | string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (next: T) => void;
  options: ReadonlyArray<T>;
  value: T;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
      <div className="bg-card flex overflow-hidden rounded-[3px] border">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={String(option)}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={
                active
                  ? 'bg-primary text-primary-foreground px-2 py-1 text-[11px] font-bold'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground px-2 py-1 text-[11px] font-bold'
              }
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Metric({
  details,
  label,
  onOpen,
  value,
}: {
  details: string[];
  label: string;
  onOpen: (metric: MetricInfo) => void;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-muted-foreground flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide">
        {label}
        <button
          type="button"
          aria-label={`${label} metric explanation`}
          aria-haspopup="dialog"
          onClick={() => onOpen({ details, label, value })}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 grid size-3.5 place-items-center rounded-sm outline-none focus-visible:ring-2"
        >
          <Info className="size-3" />
        </button>
      </div>
      <div className="text-foreground font-mono text-[12px] font-bold tabular-nums">{value}</div>
    </div>
  );
}

function MetricInfoModal({ metric, onClose }: { metric: MetricInfo | null; onClose: () => void }) {
  useEffect(() => {
    if (!metric) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [metric, onClose]);

  if (!metric) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="bg-popover text-popover-foreground w-full max-w-lg rounded-md border shadow-2xl">
        <div className="flex items-start gap-3 border-b p-4">
          <div className="min-w-0 flex-1">
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
              Metric
            </div>
            <h2 className="mt-1 font-mono text-xl font-bold tracking-wide">{metric.label}</h2>
          </div>
          <button
            type="button"
            aria-label="Close metric explanation"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 grid size-8 place-items-center rounded-sm outline-none focus-visible:ring-2"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="grid gap-4 p-4">
          <div>
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
              Current reading
            </div>
            <div className="text-foreground mt-1 font-mono text-2xl font-bold tabular-nums">
              {metric.value}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
              What it means
            </div>
            <ul className="mt-2 grid gap-3 text-sm leading-6">
              {metric.details.map((detail) => (
                <li key={detail} className="border-l-2 border-primary/50 pl-3">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const MiniTape = memo(function MiniTape({ bars, label }: { bars: TapeBar[]; label: string }) {
  return (
    <div className="bg-muted/40 relative h-16 w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '13px 13px',
        }}
      />
      <div className="absolute inset-x-1 bottom-2 flex items-end gap-1">
        {bars.map((bar) => (
          <span
            key={bar.id}
            className={bar.side === 'bid' ? 'w-1 bg-emerald-500' : 'w-1 bg-rose-500'}
            style={{ height: `${bar.height}px` }}
          />
        ))}
      </div>
      <span className="absolute left-1 top-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
        {label}
      </span>
    </div>
  );
});

function PressureMeters({ pressure }: { pressure: PressureState }) {
  return (
    <div className="grid gap-1.5 font-mono text-[11px] font-bold">
      {[
        ['IMB', pressure.imbalance, 'bg-emerald-500'],
        ['UPD', pressure.updatePressure, 'bg-rose-500'],
        ['WGT', pressure.weight, 'bg-emerald-500'],
      ].map(([label, width, color]) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="bg-muted h-3 w-48 max-w-[34vw]">
            <div
              className={`h-full ${color}`}
              style={{ width: `${Math.round((width as number) * 100)}%` }}
            />
          </div>
          <span
            className={
              label === 'UPD'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function BookCell({
  align = 'right',
  children,
  depth,
  side,
  strong,
}: {
  align?: 'left' | 'right';
  children: ReactNode;
  depth: number;
  side: 'ask' | 'bid';
  strong?: boolean;
}) {
  const fill =
    side === 'bid'
      ? strong
        ? 'bg-emerald-500/70'
        : 'bg-emerald-500/25'
      : strong
        ? 'bg-rose-500/60'
        : 'bg-rose-500/20';
  const color =
    side === 'bid' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-400';
  const inset = align === 'right' ? 'right-0' : 'left-0';

  return (
    <span
      className={`relative block min-w-0 overflow-hidden px-2 font-mono text-[18px] font-bold leading-[28px] tabular-nums ${color}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 ${inset} ${fill}`}
        style={{ width: `${Math.round(clamp(depth, 0.04, 1) * 100)}%` }}
      />
      <span className={`relative block truncate ${align === 'right' ? 'text-right' : 'text-left'}`}>
        {children}
      </span>
    </span>
  );
}

export function TerminalOrderBookExample() {
  const [rowCount, setRowCount] = useState<(typeof ROW_OPTIONS)[number]>(() =>
    readOption('rows', ROW_OPTIONS, 50),
  );
  const [targetHz, setTargetHz] = useState<(typeof RATE_OPTIONS)[number]>(() =>
    readOption('hz', RATE_OPTIONS, 60),
  );
  const [batchSize, setBatchSize] = useState<(typeof BATCH_OPTIONS)[number]>(() =>
    readOption('batch', BATCH_OPTIONS, 50),
  );
  const [memoMode, setMemoMode] = useState<MemoMode>(() =>
    readOption('memo', MEMO_OPTIONS, 'cells'),
  );
  const [coreMode, setCoreMode] = useState<CoreMode>(() =>
    readOption('core', CORE_OPTIONS, 'default'),
  );
  const [running, setRunning] = useState(true);
  const [book, setBook] = useState<BookState>(() => makeBookState(rowCount));
  const [activeMetric, setActiveMetric] = useState<MetricInfo | null>(null);
  const [stats, setStats] = useState<Stats>({
    coreCreatedPerSecond: 0,
    coreReusedPerSecond: 0,
    coreRunsPerSecond: 0,
    commitsPerSecond: 0,
    fps: 0,
    maxCommitMs: 0,
    meanCommitMs: 0,
    updatesPerSecond: 0,
  });

  const randomSeedRef = useRef(0x84_21_f0_ac);
  const sequenceRef = useRef(0);
  const frameCountRef = useRef(0);
  const updateCountRef = useRef(0);
  const commitCountRef = useRef(0);
  const commitDurationRef = useRef(0);
  const maxCommitDurationRef = useRef(0);
  const pendingUpdateRef = useRef(false);
  const coreModeRef = useRef(coreMode);
  const coreCountersRef = useRef<CoreCounters>({
    created: 0,
    reused: 0,
    runs: 0,
  });

  coreModeRef.current = coreMode;

  const openMetricInfo = useCallback((metric: MetricInfo) => {
    setActiveMetric(metric);
  }, []);

  const closeMetricInfo = useCallback(() => {
    setActiveMetric(null);
  }, []);

  const handleCoreModeChange = useCallback((next: CoreMode) => {
    const counters = coreCountersRef.current;
    counters.created = 0;
    counters.reused = 0;
    counters.runs = 0;
    setCoreMode(next);
  }, []);

  useEffect(() => {
    sequenceRef.current = 0;
    pendingUpdateRef.current = false;
    setBook(makeBookState(rowCount));
  }, [rowCount]);

  useEffect(() => {
    pendingUpdateRef.current = false;
  }, [book.rows]);

  useEffect(() => {
    let frameId = 0;
    let lastUpdate = performance.now();

    const frame = (now: number) => {
      frameCountRef.current += 1;

      if (
        running &&
        !pendingUpdateRef.current &&
        document.visibilityState === 'visible' &&
        now - lastUpdate >= 1000 / targetHz
      ) {
        lastUpdate = now;
        updateCountRef.current += batchSize;
        pendingUpdateRef.current = true;
        setBook((current) => {
          const rows = updateTerminalRows(current.rows, batchSize, randomSeedRef, sequenceRef);
          return {
            rows,
            tapeBars: advanceTapeBars(current.tapeBars, rows, randomSeedRef, sequenceRef.current),
          };
        });
      }

      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [batchSize, running, targetHz]);

  useEffect(() => {
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const seconds = Math.max((now - last) / 1000, 0.001);
      const commits = commitCountRef.current;
      const coreCounters = coreCountersRef.current;

      setStats({
        coreCreatedPerSecond: coreCounters.created / seconds,
        coreReusedPerSecond: coreCounters.reused / seconds,
        coreRunsPerSecond: coreCounters.runs / seconds,
        commitsPerSecond: commits / seconds,
        fps: frameCountRef.current / seconds,
        maxCommitMs: maxCommitDurationRef.current,
        meanCommitMs: commits ? commitDurationRef.current / commits : 0,
        updatesPerSecond: updateCountRef.current / seconds,
      });

      frameCountRef.current = 0;
      updateCountRef.current = 0;
      commitCountRef.current = 0;
      commitDurationRef.current = 0;
      coreCounters.created = 0;
      coreCounters.reused = 0;
      coreCounters.runs = 0;
      maxCommitDurationRef.current = 0;
      last = now;
    }, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  const onRender = useCallback<ProfilerOnRenderCallback>((_id, _phase, actualDuration) => {
    commitCountRef.current += 1;
    commitDurationRef.current += actualDuration;
    maxCommitDurationRef.current = Math.max(maxCommitDurationRef.current, actualDuration);
  }, []);

  const data = book.rows;
  const top = data[0];
  const midPrice = top ? (top.bidPrice + top.askPrice) / 2 : MID_PRICE;
  const pressure = useMemo(() => getPressure(data), [data]);
  const tapeLabel = getTapeLabel(book.tapeBars);
  const coreRowModel = useMemo(
    () => getSwitchableCoreRowModel<TerminalLevel>(coreCountersRef, coreModeRef),
    [],
  );

  const columns = useMemo<SST_ColumnDef<TerminalLevel>[]>(
    () => [
      {
        accessorKey: 'bidPrice',
        header: 'Bid Price',
        size: 140,
        Cell: ({ row }) => (
          <BookCell align="left" depth={row.original.bidDepth} side="bid" strong={row.index === 0}>
            {priceFormatter.format(row.original.bidPrice)}
          </BookCell>
        ),
      },
      {
        accessorKey: 'bidTotal',
        header: 'Bid Total',
        size: 130,
        Cell: ({ row }) => (
          <BookCell depth={row.original.bidDepth} side="bid" strong={row.index === 0}>
            {formatAmount(row.original.bidTotal)}
          </BookCell>
        ),
      },
      {
        accessorKey: 'bidSize',
        header: 'Bid Size',
        size: 96,
        Cell: ({ row }) => (
          <BookCell depth={row.original.bidSize / MAX_SIZE} side="bid" strong={row.index === 0}>
            <span key={row.original.bidSeq}>{formatAmount(row.original.bidSize)}</span>
          </BookCell>
        ),
      },
      {
        accessorKey: 'askSize',
        header: 'Ask Size',
        size: 96,
        Cell: ({ row }) => (
          <BookCell
            align="left"
            depth={row.original.askSize / MAX_SIZE}
            side="ask"
            strong={row.index === 0}
          >
            <span key={row.original.askSeq}>{formatAmount(row.original.askSize)}</span>
          </BookCell>
        ),
      },
      {
        accessorKey: 'askTotal',
        header: 'Ask Total',
        size: 130,
        Cell: ({ row }) => (
          <BookCell align="left" depth={row.original.askDepth} side="ask" strong={row.index === 0}>
            {formatAmount(row.original.askTotal)}
          </BookCell>
        ),
      },
      {
        accessorKey: 'askPrice',
        header: 'Ask Price',
        size: 140,
        Cell: ({ row }) => (
          <BookCell align="right" depth={row.original.askDepth} side="ask" strong={row.index === 0}>
            {priceFormatter.format(row.original.askPrice)}
          </BookCell>
        ),
      },
    ],
    [],
  );

  const slotProps = useMemo<SST_TableSlotProps<TerminalLevel>>(
    () => ({
      tableBodyCell: {
        className: 'p-0',
      },
      tableBodyRow: {
        className: 'h-7 hover:bg-transparent',
        style: { height: 28 },
      },
      tableContainer: {
        className: 'bg-card h-[452px] min-h-[452px] overflow-hidden',
      },
      tablePaper: {
        className: 'bg-card rounded-none border-0 shadow-none',
      },
    }),
    [],
  );

  const table = useShadStackTable({
    columns,
    data,
    enableBottomToolbar: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    enablePagination: false,
    enableRowVirtualization: true,
    enableSorting: false,
    enableTableFooter: false,
    enableTableHead: false,
    enableToolbarInternalActions: false,
    enableTopToolbar: false,
    getCoreRowModel: coreRowModel,
    getRowId: (row) => row.id,
    initialState: {
      density: 'compact',
    },
    layoutMode: 'grid-no-grow',
    memoMode,
    rowVirtualizerOptions: {
      estimateSize: () => 28,
      overscan: 10,
    },
    slotProps,
  });

  return (
    <div className="bg-card text-card-foreground mx-auto max-w-[780px] overflow-hidden rounded-md border shadow-xs">
      <div className="bg-muted/40 flex h-10 items-center border-b">
        <div className="min-w-0 flex-1 px-2 text-[20px] font-semibold tracking-tight">
          Orderbook <span className="text-muted-foreground">(1 Grp.)</span>
        </div>
      </div>

      <div className="bg-muted/20 flex h-11 items-center border-b">
        <div className="text-foreground flex h-full min-w-[150px] items-center gap-2 border-r px-4 text-sm font-bold">
          <span className="bg-foreground text-background grid size-5 place-items-center rounded-full">
            <Bitcoin className="size-3.5" />
          </span>
          BTCUSDT
        </div>
        <div className="flex flex-1 justify-end pr-2">
          <button
            type="button"
            aria-pressed={running}
            onClick={() => setRunning((value) => !value)}
            className={
              running
                ? 'bg-primary text-primary-foreground h-7 rounded-[3px] px-2 text-xs font-bold'
                : 'bg-muted text-muted-foreground h-7 rounded-[3px] px-2 text-xs font-bold'
            }
          >
            {running ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="bg-card grid grid-cols-[1fr_250px_1fr] items-center gap-4 border-b px-2 py-2">
        <MiniTape bars={book.tapeBars} label={tapeLabel} />
        <div className="text-center font-mono text-[56px] font-semibold leading-none tracking-wide text-emerald-600 dark:text-emerald-400">
          {priceFormatter.format(midPrice)}
        </div>
        <PressureMeters pressure={pressure} />
      </div>

      <div className="bg-muted/40 border-b px-2 py-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ControlGroup
            label="Rows"
            value={rowCount}
            options={ROW_OPTIONS}
            onChange={setRowCount}
          />
          <ControlGroup label="Hz" value={targetHz} options={RATE_OPTIONS} onChange={setTargetHz} />
          <ControlGroup
            label="Batch"
            value={batchSize}
            options={BATCH_OPTIONS}
            onChange={setBatchSize}
          />
          <ControlGroup
            label="Memo"
            value={memoMode}
            options={MEMO_OPTIONS}
            onChange={setMemoMode}
          />
          <ControlGroup
            label="Core"
            value={coreMode}
            options={CORE_OPTIONS}
            onChange={handleCoreModeChange}
          />
        </div>
        <div className="mt-2 grid grid-cols-5 gap-3">
          <Metric
            label="updates/sec"
            value={statFormatter.format(stats.updatesPerSecond)}
            onOpen={openMetricInfo}
            details={[
              'Number of individual orderbook level mutations requested per second.',
              'Computed as batch size multiplied by successful stream ticks, not unique rows changed.',
              'Example: batch 200 at 40 core runs/sec reports about 8,000 updates/sec.',
            ]}
          />
          <Metric
            label="frames/sec"
            value={stats.fps.toFixed(1)}
            onOpen={openMetricInfo}
            details={[
              'requestAnimationFrame callbacks observed per second while the page is visible.',
              'This should stay near the display refresh rate when the main thread has breathing room.',
              'A stable 60 here does not prove the table work is cheap; it only means the RAF loop is still being serviced.',
            ]}
          />
          <Metric
            label="commits/sec"
            value={stats.commitsPerSecond.toFixed(1)}
            onOpen={openMetricInfo}
            details={[
              'React Profiler commits observed per second in development or profiling builds.',
              'Normal production React does not report Profiler commit timings, so this metric is expected to be 0 there.',
              'Use this to compare dev/profiling render pressure, not production runtime health.',
            ]}
          />
          <Metric
            label="mean commit"
            value={`${stats.meanCommitMs.toFixed(2)}ms`}
            onOpen={openMetricInfo}
            details={[
              'Average React actualDuration reported by Profiler during the last one-second window.',
              'This covers React render work inside the Profiler boundary, not all browser layout, paint, or GC work.',
              'Expected to be 0 in normal production builds because Profiler timing callbacks are disabled.',
            ]}
          />
          <Metric
            label="max commit"
            value={`${stats.maxCommitMs.toFixed(2)}ms`}
            onOpen={openMetricInfo}
            details={[
              'Largest React Profiler actualDuration observed during the last one-second window.',
              'Useful for spotting long-tail render spikes in development or profiling builds.',
              'For production long-tail evidence, use Chrome tracing or heap/performance probes instead.',
            ]}
          />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <Metric
            label="core runs/sec"
            value={stats.coreRunsPerSecond.toFixed(1)}
            onOpen={openMetricInfo}
            details={[
              'Number of times TanStack core row-model work ran because the data array reference changed.',
              'In this example every stream tick creates a new rows array, so this roughly tracks successful table data ticks.',
              'This can be lower than target Hz when backpressure skips a tick while React/browser work is still pending.',
            ]}
          />
          <Metric
            label="core rows new/sec"
            value={statFormatter.format(stats.coreCreatedPerSecond)}
            onOpen={openMetricInfo}
            details={[
              'Number of TanStack Row objects created per second by the selected core row-model mode.',
              'Default mode creates every row on each data-array change: rows multiplied by core runs/sec.',
              'Reuse mode creates only rows whose row.original object changed, plus rows whose index/parent/depth guard changed.',
            ]}
          />
          <Metric
            label="core rows reused/sec"
            value={statFormatter.format(stats.coreReusedPerSecond)}
            onOpen={openMetricInfo}
            details={[
              'Number of previous TanStack Row objects reused per second by the experimental reuse mode.',
              'A row is reused only when row id, row.original reference, index, parent id, and depth all match the previous model.',
              'Low reuse is expected when batch size is large relative to row count; batch 200 over 50 rows touches almost every row each tick.',
            ]}
          />
        </div>
      </div>

      <Profiler id="terminal-orderbook-table" onRender={onRender}>
        <ShadStackTable table={table} />
      </Profiler>
      <MetricInfoModal metric={activeMetric} onClose={closeMetricInfo} />
    </div>
  );
}
