import { useEffect, useState } from 'react';
import { AdvancedExample } from './AdvancedExample';
import { BasicExample } from './BasicExample';
import { applyTheme, clearTheme, themes } from './themes';

type ExampleKey = 'basic' | 'advanced';

const examples: Array<{ key: ExampleKey; label: string; description: string }> = [
  {
    key: 'basic',
    label: 'Basic',
    description: '20-row dataset, v1 priority features enabled. Minimum smoke test.',
  },
  {
    key: 'advanced',
    label: 'Advanced',
    description:
      '30 employees · grouped column headers · custom Cell + Header renderers · row pinning · row actions · detail panel · custom toolbar with selection-aware bulk actions. Modeled on MRT’s canonical advanced demo.',
  },
];

function ChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ key: T; label: string; description?: string }>;
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
      <div className="bg-muted/50 inline-flex items-center gap-1 rounded-md border p-0.5">
        {options.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onChange(o.key)}
              title={o.description}
              aria-pressed={active}
              className={
                active
                  ? 'bg-primary text-primary-foreground rounded-sm px-2.5 py-1 text-xs font-medium shadow-xs'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground rounded-sm bg-transparent px-2.5 py-1 text-xs font-medium transition-colors'
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const modeOptions = [
  { key: 'light' as const, label: 'Light' },
  { key: 'dark' as const, label: 'Dark' },
];

export function App() {
  const [dark, setDark] = useState(true);
  const [example, setExample] = useState<ExampleKey>('advanced');
  const [themeKey, setThemeKey] = useState<string>('northern-lights');
  const current = examples.find((e) => e.key === example) ?? examples[0];
  const preset = themes.find((t) => t.key === themeKey) ?? themes[0];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    applyTheme(preset, dark ? 'dark' : 'light');
    return () => clearTheme();
  }, [preset, dark]);

  return (
    <div className="overflow-x-hidden">
      <main className="bg-background text-foreground min-h-screen p-6">
        <header className="bg-card text-card-foreground mx-auto mb-6 max-w-7xl rounded-lg border p-4 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">shadstack-table</h1>
              <p className="text-muted-foreground text-xs">playground · smoke test for the port</p>
            </div>
            <div className="flex flex-col items-end gap-y-2">
              <ChipGroup label="Example" value={example} options={examples} onChange={setExample} />
              <ChipGroup label="Theme" value={themeKey} options={themes} onChange={setThemeKey} />
              <ChipGroup
                label="Mode"
                value={dark ? 'dark' : 'light'}
                options={modeOptions}
                onChange={(next) => setDark(next === 'dark')}
              />
            </div>
          </div>
          <p className="text-muted-foreground mt-3 border-t pt-3 text-xs">{current.description}</p>
        </header>

        <section className="mx-auto max-w-7xl min-w-0 overflow-hidden">
          {example === 'basic' ? <BasicExample /> : <AdvancedExample />}
        </section>
      </main>
    </div>
  );
}
