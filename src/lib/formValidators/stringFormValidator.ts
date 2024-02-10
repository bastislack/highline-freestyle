import { z } from 'zod';
import { ValidatorMessageKeysZod } from './validatorMessages';

export interface Props {
  required: boolean;
  minLength?: number;
  maxLength?: number;
}

export default function buildIntegerFormValidator(
  props: Props,
  translator: (
    key: z.infer<typeof ValidatorMessageKeysZod>,
    data?: Record<string, string>
  ) => string
) {
  return (input: string) => {
    if (!input || input.trim().length === 0) {
      if (!props.required) {
        return true;
      } else {
        return translator('INPUT_REQUIRED');
      }
    }

    const len = input.trim().length;

    if (typeof props.minLength === 'number' && len < props.minLength) {
      return translator('INPUT_TOO_SHORT', { limit: String(props.minLength) });
    }

    if (typeof props.maxLength === 'number' && len > props.maxLength) {
      return translator('INPUT_TOO_LONG', { limit: String(props.maxLength) });
    }

    return true;
  };
}
