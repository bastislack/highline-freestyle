import { z } from 'zod';
import { ValidatorMessageKeysZod } from './validatorMessages';
import { DbPositionZod } from '../database/schemas/Version1Schema';

export interface Props {
  required: boolean;
  allowedPositionsFilter?: z.infer<typeof DbPositionZod>[];
}

const allValues = Object.values(DbPositionZod.Values);

export default function buildPositionFormValidator(
  props: Props,
  translator: (key: z.infer<typeof ValidatorMessageKeysZod>, ...args: string[]) => string
) {
  const rule = (input: unknown) => {
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      if (!props.required) {
        return true;
      } else {
        return translator('INPUT_REQUIRED');
      }
    }

    const allowedValues = props.allowedPositionsFilter ?? allValues;

    if (!allowedValues.some((e) => e === input)) {
      return translator('POSITION_INVALID');
    }

    return true;
  };
  return rule;
}
