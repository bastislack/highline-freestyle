/**
 * I am not certain if this function is super accurate or how leap years
 * and time zones are handled. But nothing hinges on this function being
 * super accurate so it is fine this way, being about right, give or take
 * about a day.
 */
export function daysSinceEpoch(epoch: number): number {
  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  const today = new Date();
  const date = new Date(epoch * 1000);

  const timeDiff = today.getTime() - date.getTime();
  const daysDiff = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);

  return daysDiff;
}

export function isStickableNew(epoch: number): boolean {
  const IS_NEW_DURATION_DAYS = 30;
  return daysSinceEpoch(epoch) <= IS_NEW_DURATION_DAYS;
}
