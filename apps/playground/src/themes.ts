// Demonstration host themes for verifying that shadstack-table respects
// consumer token overrides. These are illustrative tokens shaped like the
// presets at https://tweakcn.com/editor/theme — to drop in a real one,
// paste its `:root` / `.dark` block into the matching `light` / `dark`
// record below.
//
// Each theme is applied by writing `--<token>: <value>` onto
// `document.documentElement.style`. Because the library now declares its
// defaults at `:where(:root)` / `:where(.dark)` (0,0,0 specificity), inline
// styles on `<html>` (specificity 1,0,0,0) always win.

export type TokenMap = Record<string, string>;

export interface ThemePreset {
  key: string;
  label: string;
  description: string;
  light: TokenMap;
  dark: TokenMap;
}

export const themes: ThemePreset[] = [
  {
    key: 'default',
    label: 'Default (shadcn)',
    description: 'Library baseline. No host overrides applied.',
    light: {},
    dark: {},
  },
  {
    key: 'tangerine',
    label: 'Tangerine',
    description: 'Warm orange primary, generous radius, soft surfaces.',
    light: {
      '--radius': '1rem',
      '--background': 'oklch(0.99 0.01 80)',
      '--foreground': 'oklch(0.2 0.02 60)',
      '--card': 'oklch(0.98 0.015 80)',
      '--card-foreground': 'oklch(0.2 0.02 60)',
      '--popover': 'oklch(0.99 0.01 80)',
      '--popover-foreground': 'oklch(0.2 0.02 60)',
      '--primary': 'oklch(0.7 0.18 55)',
      '--primary-foreground': 'oklch(0.99 0 0)',
      '--secondary': 'oklch(0.95 0.04 75)',
      '--secondary-foreground': 'oklch(0.3 0.04 60)',
      '--muted': 'oklch(0.96 0.02 80)',
      '--muted-foreground': 'oklch(0.5 0.03 60)',
      '--accent': 'oklch(0.93 0.06 70)',
      '--accent-foreground': 'oklch(0.3 0.04 60)',
      '--destructive': 'oklch(0.62 0.22 25)',
      '--border': 'oklch(0.9 0.03 75)',
      '--input': 'oklch(0.93 0.02 75)',
      '--ring': 'oklch(0.7 0.18 55)',
      '--chart-4': 'oklch(0.78 0.16 65)',
    },
    dark: {
      '--radius': '1rem',
      '--background': 'oklch(0.18 0.02 60)',
      '--foreground': 'oklch(0.97 0.01 80)',
      '--card': 'oklch(0.22 0.025 60)',
      '--card-foreground': 'oklch(0.97 0.01 80)',
      '--popover': 'oklch(0.22 0.025 60)',
      '--popover-foreground': 'oklch(0.97 0.01 80)',
      '--primary': 'oklch(0.76 0.18 60)',
      '--primary-foreground': 'oklch(0.18 0.02 60)',
      '--secondary': 'oklch(0.3 0.04 60)',
      '--secondary-foreground': 'oklch(0.97 0.01 80)',
      '--muted': 'oklch(0.28 0.03 60)',
      '--muted-foreground': 'oklch(0.72 0.03 70)',
      '--accent': 'oklch(0.35 0.06 60)',
      '--accent-foreground': 'oklch(0.97 0.01 80)',
      '--destructive': 'oklch(0.7 0.2 25)',
      '--border': 'oklch(1 0 0 / 12%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.76 0.18 60)',
      '--chart-4': 'oklch(0.78 0.16 65)',
    },
  },
  {
    key: 'vintage-paper',
    label: 'Vintage Paper',
    description: 'Cream surface, sepia ink, tight radius.',
    light: {
      '--radius': '0.25rem',
      '--background': 'oklch(0.96 0.025 85)',
      '--foreground': 'oklch(0.28 0.04 50)',
      '--card': 'oklch(0.94 0.03 85)',
      '--card-foreground': 'oklch(0.28 0.04 50)',
      '--popover': 'oklch(0.96 0.025 85)',
      '--popover-foreground': 'oklch(0.28 0.04 50)',
      '--primary': 'oklch(0.4 0.07 45)',
      '--primary-foreground': 'oklch(0.96 0.025 85)',
      '--secondary': 'oklch(0.9 0.035 80)',
      '--secondary-foreground': 'oklch(0.3 0.05 45)',
      '--muted': 'oklch(0.92 0.03 80)',
      '--muted-foreground': 'oklch(0.5 0.04 50)',
      '--accent': 'oklch(0.88 0.04 75)',
      '--accent-foreground': 'oklch(0.3 0.05 45)',
      '--destructive': 'oklch(0.5 0.18 25)',
      '--border': 'oklch(0.82 0.04 70)',
      '--input': 'oklch(0.88 0.035 75)',
      '--ring': 'oklch(0.4 0.07 45)',
      '--chart-4': 'oklch(0.65 0.15 55)',
    },
    dark: {
      '--radius': '0.25rem',
      '--background': 'oklch(0.22 0.025 50)',
      '--foreground': 'oklch(0.92 0.025 85)',
      '--card': 'oklch(0.26 0.03 50)',
      '--card-foreground': 'oklch(0.92 0.025 85)',
      '--popover': 'oklch(0.26 0.03 50)',
      '--popover-foreground': 'oklch(0.92 0.025 85)',
      '--primary': 'oklch(0.85 0.04 80)',
      '--primary-foreground': 'oklch(0.22 0.025 50)',
      '--secondary': 'oklch(0.32 0.04 55)',
      '--secondary-foreground': 'oklch(0.92 0.025 85)',
      '--muted': 'oklch(0.3 0.03 55)',
      '--muted-foreground': 'oklch(0.7 0.03 75)',
      '--accent': 'oklch(0.38 0.05 55)',
      '--accent-foreground': 'oklch(0.92 0.025 85)',
      '--destructive': 'oklch(0.6 0.2 25)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 14%)',
      '--ring': 'oklch(0.85 0.04 80)',
      '--chart-4': 'oklch(0.7 0.16 60)',
    },
  },
  {
    key: 't3-chat',
    label: 'T3 Chat',
    description: 'Pink/purple primary, cool surfaces, medium radius.',
    light: {
      '--radius': '0.75rem',
      '--background': 'oklch(0.99 0.005 320)',
      '--foreground': 'oklch(0.18 0.04 320)',
      '--card': 'oklch(0.98 0.008 320)',
      '--card-foreground': 'oklch(0.18 0.04 320)',
      '--popover': 'oklch(0.99 0.005 320)',
      '--popover-foreground': 'oklch(0.18 0.04 320)',
      '--primary': 'oklch(0.62 0.22 340)',
      '--primary-foreground': 'oklch(0.99 0 0)',
      '--secondary': 'oklch(0.95 0.03 320)',
      '--secondary-foreground': 'oklch(0.3 0.06 330)',
      '--muted': 'oklch(0.96 0.015 320)',
      '--muted-foreground': 'oklch(0.5 0.05 325)',
      '--accent': 'oklch(0.92 0.05 330)',
      '--accent-foreground': 'oklch(0.3 0.08 330)',
      '--destructive': 'oklch(0.58 0.22 25)',
      '--border': 'oklch(0.9 0.02 325)',
      '--input': 'oklch(0.93 0.02 325)',
      '--ring': 'oklch(0.62 0.22 340)',
      '--chart-4': 'oklch(0.7 0.2 300)',
    },
    dark: {
      '--radius': '0.75rem',
      '--background': 'oklch(0.16 0.03 320)',
      '--foreground': 'oklch(0.96 0.01 320)',
      '--card': 'oklch(0.2 0.04 325)',
      '--card-foreground': 'oklch(0.96 0.01 320)',
      '--popover': 'oklch(0.2 0.04 325)',
      '--popover-foreground': 'oklch(0.96 0.01 320)',
      '--primary': 'oklch(0.72 0.22 340)',
      '--primary-foreground': 'oklch(0.16 0.03 320)',
      '--secondary': 'oklch(0.28 0.05 325)',
      '--secondary-foreground': 'oklch(0.96 0.01 320)',
      '--muted': 'oklch(0.26 0.04 325)',
      '--muted-foreground': 'oklch(0.72 0.05 325)',
      '--accent': 'oklch(0.34 0.08 330)',
      '--accent-foreground': 'oklch(0.96 0.01 320)',
      '--destructive': 'oklch(0.68 0.22 25)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.72 0.22 340)',
      '--chart-4': 'oklch(0.72 0.2 300)',
    },
  },
  {
    key: 'mono-ink',
    label: 'Mono Ink',
    description: 'Pure neutral palette, no chroma. Stress-tests grayscale fallbacks.',
    light: {
      '--radius': '0.5rem',
      '--background': 'oklch(0.98 0 0)',
      '--foreground': 'oklch(0.12 0 0)',
      '--card': 'oklch(0.98 0 0)',
      '--card-foreground': 'oklch(0.12 0 0)',
      '--popover': 'oklch(0.98 0 0)',
      '--popover-foreground': 'oklch(0.12 0 0)',
      '--primary': 'oklch(0.12 0 0)',
      '--primary-foreground': 'oklch(0.98 0 0)',
      '--secondary': 'oklch(0.93 0 0)',
      '--secondary-foreground': 'oklch(0.12 0 0)',
      '--muted': 'oklch(0.94 0 0)',
      '--muted-foreground': 'oklch(0.45 0 0)',
      '--accent': 'oklch(0.9 0 0)',
      '--accent-foreground': 'oklch(0.12 0 0)',
      '--destructive': 'oklch(0.5 0.2 25)',
      '--border': 'oklch(0.85 0 0)',
      '--input': 'oklch(0.88 0 0)',
      '--ring': 'oklch(0.5 0 0)',
      '--chart-4': 'oklch(0.6 0 0)',
    },
    dark: {
      '--radius': '0.5rem',
      '--background': 'oklch(0.1 0 0)',
      '--foreground': 'oklch(0.98 0 0)',
      '--card': 'oklch(0.16 0 0)',
      '--card-foreground': 'oklch(0.98 0 0)',
      '--popover': 'oklch(0.16 0 0)',
      '--popover-foreground': 'oklch(0.98 0 0)',
      '--primary': 'oklch(0.98 0 0)',
      '--primary-foreground': 'oklch(0.1 0 0)',
      '--secondary': 'oklch(0.22 0 0)',
      '--secondary-foreground': 'oklch(0.98 0 0)',
      '--muted': 'oklch(0.2 0 0)',
      '--muted-foreground': 'oklch(0.72 0 0)',
      '--accent': 'oklch(0.3 0 0)',
      '--accent-foreground': 'oklch(0.98 0 0)',
      '--destructive': 'oklch(0.62 0.2 25)',
      '--border': 'oklch(1 0 0 / 12%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.7 0 0)',
      '--chart-4': 'oklch(0.7 0 0)',
    },
  },
];

const TOKEN_KEYS = Array.from(
  new Set(themes.flatMap((t) => [...Object.keys(t.light), ...Object.keys(t.dark)])),
);

export function applyTheme(preset: ThemePreset, mode: 'light' | 'dark') {
  const root = document.documentElement;
  const tokens = mode === 'dark' ? preset.dark : preset.light;
  for (const key of TOKEN_KEYS) {
    if (tokens[key]) root.style.setProperty(key, tokens[key]);
    else root.style.removeProperty(key);
  }
}

export function clearTheme() {
  const root = document.documentElement;
  for (const key of TOKEN_KEYS) root.style.removeProperty(key);
}
