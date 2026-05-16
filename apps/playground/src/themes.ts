// Host themes for verifying that shadstack-table respects consumer token
// overrides. Each preset's light/dark blocks are pulled verbatim from the
// matching registry entry at https://tweakcn.com/r/themes/<slug>.json
// (e.g. modern-minimal, northern-lights, darkmatter). Only the tokens
// that the library actually consumes are kept here — sidebar/shadow/font
// vars from the upstream JSON are intentionally dropped.
//
// Each theme is applied by writing `--<token>: <value>` onto
// `document.documentElement.style`. Because the library declares its
// defaults at `:where(:root)` / `:where(.dark)` (0,0,0 specificity),
// inline styles on `<html>` (specificity 1,0,0,0) always win.

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
    key: 'northern-lights',
    label: 'Northern Lights',
    description: 'Aurora-inspired green/blue/teal accents on a near-white surface.',
    light: {
      '--background': 'oklch(0.9824 0.0013 286.3757)',
      '--foreground': 'oklch(0.3211 0 0)',
      '--card': 'oklch(1.0000 0 0)',
      '--card-foreground': 'oklch(0.3211 0 0)',
      '--popover': 'oklch(1.0000 0 0)',
      '--popover-foreground': 'oklch(0.3211 0 0)',
      '--primary': 'oklch(0.6487 0.1538 150.3071)',
      '--primary-foreground': 'oklch(1.0000 0 0)',
      '--secondary': 'oklch(0.6746 0.1414 261.3380)',
      '--secondary-foreground': 'oklch(1.0000 0 0)',
      '--muted': 'oklch(0.8828 0.0285 98.1033)',
      '--muted-foreground': 'oklch(0.5382 0 0)',
      '--accent': 'oklch(0.8269 0.1080 211.9627)',
      '--accent-foreground': 'oklch(0.3211 0 0)',
      '--destructive': 'oklch(0.6368 0.2078 25.3313)',
      '--border': 'oklch(0.8699 0 0)',
      '--input': 'oklch(0.8699 0 0)',
      '--ring': 'oklch(0.6487 0.1538 150.3071)',
      '--chart-1': 'oklch(0.6487 0.1538 150.3071)',
      '--chart-2': 'oklch(0.6746 0.1414 261.3380)',
      '--chart-3': 'oklch(0.8269 0.1080 211.9627)',
      '--chart-4': 'oklch(0.5880 0.0993 245.7394)',
      '--chart-5': 'oklch(0.5905 0.1608 148.2409)',
      '--radius': '0.5rem',
    },
    dark: {
      '--background': 'oklch(0.2303 0.0125 264.2926)',
      '--foreground': 'oklch(0.9219 0 0)',
      '--card': 'oklch(0.3210 0.0078 223.6661)',
      '--card-foreground': 'oklch(0.9219 0 0)',
      '--popover': 'oklch(0.3210 0.0078 223.6661)',
      '--popover-foreground': 'oklch(0.9219 0 0)',
      '--primary': 'oklch(0.6487 0.1538 150.3071)',
      '--primary-foreground': 'oklch(1.0000 0 0)',
      '--secondary': 'oklch(0.5880 0.0993 245.7394)',
      '--secondary-foreground': 'oklch(0.9219 0 0)',
      '--muted': 'oklch(0.3867 0 0)',
      '--muted-foreground': 'oklch(0.7155 0 0)',
      '--accent': 'oklch(0.6746 0.1414 261.3380)',
      '--accent-foreground': 'oklch(0.9219 0 0)',
      '--destructive': 'oklch(0.6368 0.2078 25.3313)',
      '--border': 'oklch(0.3867 0 0)',
      '--input': 'oklch(0.3867 0 0)',
      '--ring': 'oklch(0.6487 0.1538 150.3071)',
      '--chart-1': 'oklch(0.6487 0.1538 150.3071)',
      '--chart-2': 'oklch(0.5880 0.0993 245.7394)',
      '--chart-3': 'oklch(0.6746 0.1414 261.3380)',
      '--chart-4': 'oklch(0.8269 0.1080 211.9627)',
      '--chart-5': 'oklch(0.5905 0.1608 148.2409)',
      '--radius': '0.5rem',
    },
  },
  {
    key: 'dark-matter',
    label: 'Dark Matter',
    description: 'Near-black surface with vivid orange primary and teal accents.',
    light: {
      '--background': 'oklch(1.0000 0 0)',
      '--foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--card': 'oklch(1.0000 0 0)',
      '--card-foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--popover': 'oklch(1.0000 0 0)',
      '--popover-foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--primary': 'oklch(0.6716 0.1368 48.5130)',
      '--primary-foreground': 'oklch(1.0000 0 0)',
      '--secondary': 'oklch(0.5360 0.0398 196.0280)',
      '--secondary-foreground': 'oklch(1.0000 0 0)',
      '--muted': 'oklch(0.9670 0.0029 264.5419)',
      '--muted-foreground': 'oklch(0.5510 0.0234 264.3637)',
      '--accent': 'oklch(0.9491 0 0)',
      '--accent-foreground': 'oklch(0.2101 0.0318 264.6645)',
      '--destructive': 'oklch(0.6368 0.2078 25.3313)',
      '--border': 'oklch(0.9276 0.0058 264.5313)',
      '--input': 'oklch(0.9276 0.0058 264.5313)',
      '--ring': 'oklch(0.6716 0.1368 48.5130)',
      '--chart-1': 'oklch(0.5940 0.0443 196.0233)',
      '--chart-2': 'oklch(0.7214 0.1337 49.9802)',
      '--chart-3': 'oklch(0.8721 0.0864 68.5474)',
      '--chart-4': 'oklch(0.6268 0 0)',
      '--chart-5': 'oklch(0.6830 0 0)',
      '--radius': '0.75rem',
    },
    dark: {
      '--background': 'oklch(0.1797 0.0043 308.1928)',
      '--foreground': 'oklch(0.8109 0 0)',
      '--card': 'oklch(0.1822 0 0)',
      '--card-foreground': 'oklch(0.8109 0 0)',
      '--popover': 'oklch(0.1797 0.0043 308.1928)',
      '--popover-foreground': 'oklch(0.8109 0 0)',
      '--primary': 'oklch(0.7214 0.1337 49.9802)',
      '--primary-foreground': 'oklch(0.1797 0.0043 308.1928)',
      '--secondary': 'oklch(0.5940 0.0443 196.0233)',
      '--secondary-foreground': 'oklch(0.1797 0.0043 308.1928)',
      '--muted': 'oklch(0.2520 0 0)',
      '--muted-foreground': 'oklch(0.6268 0 0)',
      '--accent': 'oklch(0.3211 0 0)',
      '--accent-foreground': 'oklch(0.8109 0 0)',
      '--destructive': 'oklch(0.5940 0.0443 196.0233)',
      '--border': 'oklch(0.2520 0 0)',
      '--input': 'oklch(0.2520 0 0)',
      '--ring': 'oklch(0.7214 0.1337 49.9802)',
      '--chart-1': 'oklch(0.5940 0.0443 196.0233)',
      '--chart-2': 'oklch(0.7214 0.1337 49.9802)',
      '--chart-3': 'oklch(0.8721 0.0864 68.5474)',
      '--chart-4': 'oklch(0.6268 0 0)',
      '--chart-5': 'oklch(0.6830 0 0)',
      '--radius': '0.75rem',
    },
  },
  {
    key: 'modern-minimal',
    label: 'Modern Minimal',
    description: 'Restrained neutrals with a clean blue primary.',
    light: {
      '--background': 'oklch(1.0000 0 0)',
      '--foreground': 'oklch(0.3211 0 0)',
      '--card': 'oklch(1.0000 0 0)',
      '--card-foreground': 'oklch(0.3211 0 0)',
      '--popover': 'oklch(1.0000 0 0)',
      '--popover-foreground': 'oklch(0.3211 0 0)',
      '--primary': 'oklch(0.6231 0.1880 259.8145)',
      '--primary-foreground': 'oklch(1.0000 0 0)',
      '--secondary': 'oklch(0.9670 0.0029 264.5419)',
      '--secondary-foreground': 'oklch(0.4461 0.0263 256.8018)',
      '--muted': 'oklch(0.9846 0.0017 247.8389)',
      '--muted-foreground': 'oklch(0.5510 0.0234 264.3637)',
      '--accent': 'oklch(0.9514 0.0250 236.8242)',
      '--accent-foreground': 'oklch(0.3791 0.1378 265.5222)',
      '--destructive': 'oklch(0.6368 0.2078 25.3313)',
      '--border': 'oklch(0.9276 0.0058 264.5313)',
      '--input': 'oklch(0.9276 0.0058 264.5313)',
      '--ring': 'oklch(0.6231 0.1880 259.8145)',
      '--chart-1': 'oklch(0.6231 0.1880 259.8145)',
      '--chart-2': 'oklch(0.5461 0.2152 262.8809)',
      '--chart-3': 'oklch(0.4882 0.2172 264.3763)',
      '--chart-4': 'oklch(0.4244 0.1809 265.6377)',
      '--chart-5': 'oklch(0.3791 0.1378 265.5222)',
      '--radius': '0.375rem',
    },
    dark: {
      '--background': 'oklch(0.2046 0 0)',
      '--foreground': 'oklch(0.9219 0 0)',
      '--card': 'oklch(0.2686 0 0)',
      '--card-foreground': 'oklch(0.9219 0 0)',
      '--popover': 'oklch(0.2686 0 0)',
      '--popover-foreground': 'oklch(0.9219 0 0)',
      '--primary': 'oklch(0.6231 0.1880 259.8145)',
      '--primary-foreground': 'oklch(1.0000 0 0)',
      '--secondary': 'oklch(0.2686 0 0)',
      '--secondary-foreground': 'oklch(0.9219 0 0)',
      '--muted': 'oklch(0.2393 0 0)',
      '--muted-foreground': 'oklch(0.7155 0 0)',
      '--accent': 'oklch(0.3791 0.1378 265.5222)',
      '--accent-foreground': 'oklch(0.8823 0.0571 254.1284)',
      '--destructive': 'oklch(0.6368 0.2078 25.3313)',
      '--border': 'oklch(0.3715 0 0)',
      '--input': 'oklch(0.3715 0 0)',
      '--ring': 'oklch(0.6231 0.1880 259.8145)',
      '--chart-1': 'oklch(0.7137 0.1434 254.6240)',
      '--chart-2': 'oklch(0.6231 0.1880 259.8145)',
      '--chart-3': 'oklch(0.5461 0.2152 262.8809)',
      '--chart-4': 'oklch(0.4882 0.2172 264.3763)',
      '--chart-5': 'oklch(0.4244 0.1809 265.6377)',
      '--radius': '0.375rem',
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
