// Validates that TypeScript resolves the package and locale subpaths through
// the exports field's `types` condition. tsc --noEmit is invoked against this
// file by verify.mjs.

import { type SST_Localization } from 'shadstack-table';
import { SST_Localization_EN } from 'shadstack-table/locales/en';
import { SST_Localization_PT_BR } from 'shadstack-table/locales/pt-BR';
import { SST_Localization_ZH_HANS } from 'shadstack-table/locales/zh-Hans';
import { SST_Localization_SR_LATN_RS } from 'shadstack-table/locales/sr-Latn-RS';

const locales: SST_Localization[] = [
  SST_Localization_EN,
  SST_Localization_PT_BR,
  SST_Localization_ZH_HANS,
  SST_Localization_SR_LATN_RS,
];

export { locales };
