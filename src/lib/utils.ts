import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';
import { DbStickableStatusZod, DbReferenceZod } from '@/lib/database/schemas/CurrentVersionSchema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type StickableStatus = z.infer<typeof DbStickableStatusZod>;
export type PrimaryKey = z.infer<typeof DbReferenceZod>;

export function primaryKeysMatch(pk1: Readonly<PrimaryKey>, pk2: Readonly<PrimaryKey>): boolean {
  return pk1[0] === pk2[0] && pk1[1] === pk2[1];
}
