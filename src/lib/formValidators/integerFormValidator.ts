import { z } from 'zod';
import { FormValidator, ValidatorMessageKeysZod } from './validatorMessages';

export interface Props {
  required: boolean;
  minInclusive: number;
  maxInclusive: number;
}

export default function buildIntegerFormValidator(
  props: Props,
  translator: (
    key: z.infer<typeof ValidatorMessageKeysZod>,
    data?: Record<string, string>
  ) => string
): FormValidator {
  return (input: string) => {
    if (!input || input.trim().length === 0) {
      if (!props.required) {
        return true;
      } else {
        return translator('INPUT_REQUIRED');
      }
    }
    const asNumber = Number(input.trim());
    if (Number.isNaN(asNumber)) {
      return translator('INPUT_NOT_NUMBER');
    }

    if (asNumber % 1 !== 0) {
      return translator('INPUT_NOT_INTEGER');
    }

    if (asNumber < props.minInclusive) {
      return translator('INPUT_NUMBER_BELOW_MIN', { value: String(props.minInclusive) });
    }

    if (asNumber > props.maxInclusive) {
      return translator('INPUT_NUMBER_ABOVE_MAX', { value: String(props.maxInclusive) });
    }

    return true;
  };
}
