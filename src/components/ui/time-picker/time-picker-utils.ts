/**
 * regular expression to check for valid hour format (01-23)
 */
export function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
export function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

export type TimestampSeconds = number;

export class Timestamp {
  hours: number;
  minutes: number;
  seconds: number;

  constructor(hours: number, minutes: number, seconds: number) {
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
  }
}

export function timestampToSeconds(timestamp: Timestamp): TimestampSeconds {
  const seconds = timestamp.hours * 60 * 60 + timestamp.minutes * 60 + timestamp.seconds;
  console.log(
    `Timestamp to Seconds: (${timestamp.hours}, ${timestamp.minutes}, ${timestamp.seconds}) -> ${seconds}`
  );
  return seconds;
}

export function secondsToTimestamp(seconds: TimestampSeconds): Timestamp {
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

export function toValid2DigitNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig
): string {
  let numericValue = parseInt(value, 10);

  if (!isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, '0');
  }

  return '00';
}

export function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return toValid2DigitNumber(value, { max: 23 });
}

export function getValidMinuteOrSecond(value: string): string {
  if (isValidMinuteOrSecond(value)) return value;
  return toValid2DigitNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

export function getValidArrowNumber(
  value: string,
  { min, max, step }: GetValidArrowNumberConfig
): string {
  let numericValue = parseInt(value, 10);
  if (!isNaN(numericValue)) {
    numericValue += step;
    return toValid2DigitNumber(String(numericValue), { min, max, loop: true });
  }
  return '00';
}

export function getValidArrowHour(value: string, step: number): string {
  return getValidArrowNumber(value, { min: 0, max: 23, step });
}

export function getValidArrowMinuteOrSecond(value: string, step: number): string {
  return getValidArrowNumber(value, { min: 0, max: 59, step });
}

export function setMinutes(timestamp: Timestamp, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  timestamp.minutes = parseInt(minutes, 10);
  return timestamp;
}

export function setSeconds(timestamp: Timestamp, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  timestamp.seconds = parseInt(seconds, 10);
  return timestamp;
}

export function setHours(timestamp: Timestamp, value: string) {
  const hours = getValidHour(value);
  timestamp.hours = parseInt(hours, 10);
  return timestamp;
}

export type TimePickerType = 'minutes' | 'seconds' | 'hours';

export function setTimestampByType(
  timestamp: Timestamp,
  value: string,
  type: TimePickerType
): Timestamp {
  switch (type) {
    case 'minutes':
      return setMinutes(timestamp, value);
    case 'seconds':
      return setSeconds(timestamp, value);
    case 'hours':
      return setHours(timestamp, value);
    default:
      return timestamp;
  }
}

export function getTimestampFieldAsString(timestamp: Timestamp, type: TimePickerType): string {
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(timestamp.minutes));
    case 'seconds':
      return getValidMinuteOrSecond(String(timestamp.seconds));
    case 'hours':
      return getValidHour(String(timestamp.hours));
    default:
      return '00';
  }
}

export function getArrowByType(value: string, step: number, type: TimePickerType): string {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step);
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step);
    case 'hours':
      return getValidArrowHour(value, step);
    default:
      return '00';
  }
}
