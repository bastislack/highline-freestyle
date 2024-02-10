/* eslint-disable @typescript-eslint/no-explicit-any */

export function i18nMerge<T>(source: object & Exclude<T, any[]>): T;
export function i18nMerge<T, U>(
  source: object & Exclude<T, any[]>,
  source2: object & Exclude<U, any[]>
): T & U;
export function i18nMerge<T, U, V>(
  source: object & Exclude<T, any[]>,
  source2: object & Exclude<U, any[]>,
  source3: object & Exclude<V, any[]>
): T & U & V;
export function i18nMerge<T, U, V, W>(
  source: object & Exclude<T, any[]>,
  source2: object & Exclude<U, any[]>,
  source3: object & Exclude<V, any[]>,
  source4: object & Exclude<W, any[]>
): T & U & V & W;

export function i18nMerge<T>(...sources: object & Exclude<T, any[]>[]) {
  const messages = sources.reduce((accumulator, source) => {
    // @ts-expect-error Some cursed merging
    Object.keys(source).forEach((key) => {
      // @ts-expect-error Some cursed merging
      accumulator[key] = {
        // @ts-expect-error Some cursed merging
        ...(accumulator[key] || {}),
        // @ts-expect-error Some cursed merging
        ...source[key],
      };
    });
    return accumulator;
  });
  return messages;
}
