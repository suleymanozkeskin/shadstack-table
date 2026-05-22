import { type SST_ColumnDef } from 'shadstack-table';

export type BenchPerson = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
};

// Tiny deterministic LCG so runs are reproducible without pulling in a
// seeded-random dependency. Math.random() would re-roll between runs and
// make the resulting numbers harder to compare.
const lcg = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 0x1_00_00_00_00;
  };
};

const FIRST_NAMES = [
  'Ada',
  'Grace',
  'Linus',
  'Margaret',
  'Edsger',
  'Alan',
  'Barbara',
  'Donald',
  'Edith',
  'Frances',
  'Gordon',
  'Hedy',
  'Ivan',
  'Jean',
  'Karen',
  'Leslie',
];

const LAST_NAMES = [
  'Lovelace',
  'Hopper',
  'Torvalds',
  'Hamilton',
  'Dijkstra',
  'Turing',
  'Liskov',
  'Knuth',
  'Clarke',
  'Allen',
  'Bell',
  'Lamarr',
  'Sutherland',
  'Bartik',
  'Sparck Jones',
  'Lamport',
];

export const makePeople = (n: number, seed = 0xc0_ff_ee): BenchPerson[] => {
  const rand = lcg(seed);
  const rows: BenchPerson[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)] ?? 'Ada';
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)] ?? 'Lovelace';
    const age = 18 + Math.floor(rand() * 60);
    rows[i] = {
      id: `p${i.toString().padStart(7, '0')}`,
      firstName,
      lastName,
      age,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.test`,
    };
  }
  return rows;
};

export const benchColumns: SST_ColumnDef<BenchPerson>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'email', header: 'Email' },
];
