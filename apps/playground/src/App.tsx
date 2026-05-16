import { useEffect, useState } from 'react';
import { AdvancedExample } from './AdvancedExample';
import { BasicExample } from './BasicExample';
import { ThemedExample } from './ThemedExample';

type ExampleKey = 'basic' | 'advanced' | 'themed';

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
  {
    key: 'themed',
    label: 'Themed',
    description:
      'Swap host CSS-variable presets at runtime (shaped like tweakcn.com themes) to verify the table picks up consumer tokens — surface, primary, radius, borders all flow through.',
  },
];

export function App() {
  const [dark, setDark] = useState(false);
  const [example, setExample] = useState<ExampleKey>('basic');
  const current = examples.find((e) => e.key === example) ?? examples[0];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="overflow-x-hidden">
      <main className="bg-background text-foreground min-h-screen p-6">
        <header className="mx-auto mb-6 flex max-w-7xl items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">shadstack-table</h1>
            <p className="text-muted-foreground text-sm">playground · smoke test for the port</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-muted-foreground text-sm" htmlFor="example-select">
              Example
            </label>
            <select
              id="example-select"
              value={example}
              onChange={(e) => setExample(e.target.value as ExampleKey)}
              className="border-input bg-background hover:bg-accent rounded-md border px-2 py-1 text-sm shadow-xs transition-colors"
            >
              {examples.map((e) => (
                <option key={e.key} value={e.key}>
                  {e.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="border-input hover:bg-accent rounded-md border bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors"
            >
              {dark ? 'Light' : 'Dark'} mode
            </button>
          </div>
        </header>

        <section className="mx-auto mb-3 max-w-7xl">
          <p className="text-muted-foreground text-xs">{current.description}</p>
        </section>

        <section className="mx-auto max-w-7xl min-w-0 overflow-hidden">
          {example === 'basic' ? (
            <BasicExample />
          ) : example === 'advanced' ? (
            <AdvancedExample />
          ) : (
            <ThemedExample dark={dark} />
          )}
        </section>
      </main>
    </div>
  );
}
