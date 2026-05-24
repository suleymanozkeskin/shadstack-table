import { BenchHarness } from './BenchHarness';
import { Playground } from './Playground';

// `?bench=true` swaps the playground for a minimal benchmarking harness
// driven by Playwright (see apps/bench/playwright/). Keeping the switch at
// the App level means the normal interactive playground keeps zero
// overhead when not in bench mode.
const isBench =
  typeof window !== 'undefined' &&
  new URL(window.location.href).searchParams.get('bench') === 'true';

export function App() {
  if (isBench) {
    return (
      <div className="overflow-x-hidden">
        <main className="bg-background text-foreground min-h-screen">
          <BenchHarness />
        </main>
      </div>
    );
  }
  return (
    <div className="overflow-x-hidden">
      <main className="bg-background text-foreground min-h-screen p-6">
        <Playground />
      </main>
    </div>
  );
}
