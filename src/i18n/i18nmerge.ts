// eslint-disable-next-line @typescript-eslint/no-explicit-any
type I18n<T> = object & Exclude<T, any[]>;

export function i18nMerge<A>(source: I18n<A>): A;
export function i18nMerge<A, B>(source: I18n<A>, source2: I18n<B>): A & B;
export function i18nMerge<A, B, C>(source: I18n<A>, source2: I18n<B>, source3: I18n<C>): A & B & C;
export function i18nMerge<A, B, C, D>(
  source: I18n<A>,
  source2: I18n<B>,
  source3: I18n<C>,
  source4: I18n<D>
): A & B & C & D;

export function i18nMerge<T>(...sources: I18n<T>[]) {
  const messages = sources.reduce((accumulator, source) => {
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
