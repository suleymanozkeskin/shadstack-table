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

import {
  createRow,
  createSSTColumnHelper,
  type SST_TableInstance,
  type SST_DensityState,
  type SST_TableOptions,
} from 'shadstack-table';

type Person = {
  name: string;
  age: number;
  joinedAt: Date;
  address: { city: string };
};

export const options: SST_TableOptions<Person> = {
  data: [],
  columns: [{ accessorKey: 'name', header: 'Name' }],
  theme: (defaults) => ({ menuBackgroundColor: defaults.baseBackgroundColor }),
};

// Compiled against published declarations. This function is not executed.
export function checkPublicContracts(table: SST_TableInstance<Person>): void {
  const initial: Person = { name: '', age: 0, joinedAt: new Date(), address: { city: '' } };
  const row = createRow(table, initial);
  const cacheIsInternal: '_valuesCache' extends keyof typeof row ? false : true = true;
  void cacheIsInternal;
  table.setCreatingRow(row);
  table.setCreatingRow(() => createRow(table, initial));
  table.setCreatingRow(null);

  const subscription = table.atoms.density.subscribe({
    next: (density) => {
      const checked: SST_DensityState = density;
      void checked;
    },
  });

  subscription.unsubscribe();
  const density: SST_DensityState = table.state.density;
  void density;

  // @ts-expect-error Initial application data is required.
  createRow(table);
  // @ts-expect-error Creation cannot invent application defaults.
  table.setCreatingRow(true);
  // @ts-expect-error Updaters must also return a row or null.
  table.setCreatingRow(() => true);
  // @ts-expect-error An empty string is not a numeric age.
  createRow(table, { ...initial, age: '' });
}

const columnHelper = createSSTColumnHelper<Person>();

export const ageColumn = columnHelper.accessor('age', {
  header: 'Age',
  Cell: ({ cell }) => {
    const age: number = cell.getValue();
    // @ts-expect-error A numeric accessor does not produce a string.
    const text: string = cell.getValue();
    void text;

    return age;
  },
});
