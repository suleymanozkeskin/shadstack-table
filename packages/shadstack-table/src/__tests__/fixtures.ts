import { type MRT_ColumnDef } from '../types';

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

export const personColumns: MRT_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
];

export const personColumnsWithAge: MRT_ColumnDef<Person>[] = [
  { accessorKey: 'firstName', header: 'First name' },
  { accessorKey: 'lastName', header: 'Last name' },
  { accessorKey: 'age', header: 'Age' },
];
