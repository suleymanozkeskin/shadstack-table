import { useEffect, useState } from 'react';
import { BasicExample } from './BasicExample';
import { applyTheme, clearTheme, themes } from './themes';

interface ThemedExampleProps {
  dark: boolean;
}

export function ThemedExample({ dark }: ThemedExampleProps) {
  const [themeKey, setThemeKey] = useState<string>(themes[0].key);
  const preset = themes.find((t) => t.key === themeKey) ?? themes[0];

  useEffect(() => {
    applyTheme(preset, dark ? 'dark' : 'light');
    return () => clearTheme();
  }, [preset, dark]);

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-card text-card-foreground flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Host theme</p>
          <p className="text-muted-foreground text-xs">{preset.description}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {themes.map((t) => {
            const active = t.key === themeKey;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setThemeKey(t.key)}
                className={
                  active
                    ? 'bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm shadow-xs'
                    : 'border-input hover:bg-accent hover:text-accent-foreground rounded-md border bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors'
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <BasicExample />
    </div>
  );
}
