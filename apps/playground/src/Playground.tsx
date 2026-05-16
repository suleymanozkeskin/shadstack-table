import { useEffect, useState } from 'react';
import { AdvancedExample } from './AdvancedExample';
import { BasicExample } from './BasicExample';
import { applyTheme, clearTheme, themes } from './themes';

type ExampleKey = 'basic' | 'advanced';

const examples: Array<{ key: ExampleKey; label: string; description: string }> = [
  {
    key: 'basic',
    label: 'Basic',
    description: 'pick the theme and the example combination',
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

export interface PlaygroundProps {
  /**
   * Where the playground's light/dark state lives.
   *
   * - `'self'` (default): the playground owns its own Mode chip and toggles
   *   `.dark` on `<html>` itself. Use this when the playground is the page
   *   (apps/playground).
   * - `'host'`: there is no Mode chip; the playground reads `data-theme`
   *   from `<html>` and re-applies its theme tokens whenever the host
   *   (Starlight) flips it. Use this when embedding in docs so the host's
   *   own dark-mode toggle is the single source of truth.
   */
  modeSource?: 'self' | 'host';
  defaultExample?: ExampleKey;
  defaultThemeKey?: string;
  defaultDark?: boolean;
}

function readHostDark(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

export function Playground({
  modeSource = 'self',
  defaultExample = 'advanced',
  defaultThemeKey = 'northern-lights',
  defaultDark = true,
}: PlaygroundProps = {}) {
  const [dark, setDark] = useState(modeSource === 'host' ? readHostDark : defaultDark);
  const [example, setExample] = useState<ExampleKey>(defaultExample);
  const [themeKey, setThemeKey] = useState<string>(defaultThemeKey);
  const current = examples.find((e) => e.key === example) ?? examples[0];
  const preset = themes.find((t) => t.key === themeKey) ?? themes[0];

  // Self mode: own the `.dark` class on <html> so library `dark:` variants
  // light up. Host mode: leave the class alone — Starlight already manages
  // `data-theme` and the docs CSS aliases the dark scope to cover both.
  useEffect(() => {
    if (modeSource !== 'self') return;
    document.documentElement.classList.toggle('dark', dark);
  }, [dark, modeSource]);

  // Host mode: subscribe to `<html data-theme>` changes (the user clicking
  // Starlight's Light/Dark toggle) and mirror them into our `dark` state,
  // which feeds the applyTheme effect below.
  useEffect(() => {
    if (modeSource !== 'host') return;
    const html = document.documentElement;
    setDark(readHostDark());
    const observer = new MutationObserver(() => setDark(readHostDark()));
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [modeSource]);

  useEffect(() => {
    applyTheme(preset, dark ? 'dark' : 'light');
    return () => clearTheme();
  }, [preset, dark]);

  return (
    <>
      <header className="bg-card text-card-foreground mx-auto mb-6 max-w-7xl rounded-lg border p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">shadstack-table</h1>
            <p className="text-muted-foreground text-xs">playground examples</p>
          </div>
          <div className="flex flex-col items-end gap-y-2">
            <ChipGroup label="Example" value={example} options={examples} onChange={setExample} />
            <ChipGroup label="Theme" value={themeKey} options={themes} onChange={setThemeKey} />
            {modeSource === 'self' && (
              <ChipGroup
                label="Mode"
                value={dark ? 'dark' : 'light'}
                options={modeOptions}
                onChange={(next) => setDark(next === 'dark')}
              />
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-3 border-t pt-3 text-xs">{current.description}</p>
      </header>

      <section className="mx-auto max-w-7xl min-w-0 overflow-hidden">
        {example === 'basic' ? <BasicExample /> : <AdvancedExample />}
      </section>
    </>
  );
}
