import { z } from 'zod';

export const ValidatorMessageKeysZod = z.enum([
  'INPUT_REQUIRED',
  'INPUT_NOT_NUMBER',
  'INPUT_NOT_INTEGER',
  'INPUT_NUMBER_BELOW_MIN',
  'INPUT_NUMBER_ABOVE_MAX',
  'POSITION_INVALID',
  'INPUT_TOO_SHORT',
  'INPUT_TOO_LONG',
]);

export type FormValidator<T = string> = (input: T) => string | true;
