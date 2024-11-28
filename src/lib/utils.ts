import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type StickableStatus = 'official' | 'userDefined' | 'archived';
type PrimaryKey = [number, StickableStatus];

export function primaryKeysMatch(pk1: Readonly<PrimaryKey>, pk2: Readonly<PrimaryKey>): boolean {
  return pk1[0] === pk2[0] && pk1[1] === pk2[1];
}
