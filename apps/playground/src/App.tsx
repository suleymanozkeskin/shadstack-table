import { VERSION } from 'shadstack-table';

export function App() {
  return (
    <main
      style={{
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        padding: '2rem',
        maxWidth: 960,
        margin: '0 auto',
        color: '#0a0a0a',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '1.75rem' }}>shadstack-table</h1>
      <p style={{ color: '#525252' }}>playground · library v{VERSION}</p>
      <p>
        Scaffold ready. Library entry resolves through bun workspaces; next step is wiring the core{' '}
        <code>useTable</code> hook and the shadcn primitives adapter.
      </p>
    </main>
  );
}
