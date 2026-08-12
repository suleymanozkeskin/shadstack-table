import { type SST_ColumnDef } from '../types';

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

export const people: Person[] = [
  { id: 'p001', firstName: 'Ada', lastName: 'Lovelace', age: 36 },
  { id: 'p002', firstName: 'Grace', lastName: 'Hopper', age: 52 },
  { id: 'p003', firstName: 'Linus', lastName: 'Torvalds', age: 41 },
  { id: 'p004', firstName: 'Margaret', lastName: 'Hamilton', age: 47 },
  { id: 'p005', firstName: 'Edsger', lastName: 'Dijkstra', age: 38 },
];

export type NestedPerson = Person & {
  subRows?: NestedPerson[];
};

/**
 * Two parents with two children each. Used to exercise sub-row selection, whose
 * cascade behaviour lives in TanStack rather than in shadstack.
 */
export const nestedPeople: NestedPerson[] = [
  {
    id: 'n001',
    firstName: 'Ada',
    lastName: 'Lovelace',
    age: 36,
    subRows: [
      { id: 'n001a', firstName: 'Anne', lastName: 'Lovelace', age: 12 },
      { id: 'n001b', firstName: 'Byron', lastName: 'Lovelace', age: 9 },
    ],
  },
  {
    id: 'n002',
    firstName: 'Grace',
    lastName: 'Hopper',
    age: 52,
    subRows: [
      { id: 'n002a', firstName: 'Gale', lastName: 'Hopper', age: 21 },
      { id: 'n002b', firstName: 'Gus', lastName: 'Hopper', age: 18 },
    ],
  },
];

export const personColumns: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
];

export const personColumnsWithAge: SST_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
  { accessorKey: 'age', header: 'Age' },
];
