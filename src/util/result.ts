/**
 * Rust inspired Result type used for explicity returning an propagating
 * errors.
 *
 * Can be used like this:
 *
 * ```ts
 * function divide(a: number, b: number): Result<number, string> {
 *   if(b === 0) {
 *      return Err("Cannot divide by 0")
 *   }
 *   return Ok(a / b)
 * }
 * ```
 *
 * When working with a result, the value of `ok` needs to be checked before the
 * content (data or err) can safely be accessed:
 *
 * ```ts
 * const result = divide(1, 2)
 * if(result.ok) {
 *   console.log(result.data)
 * }
 * else {
 *   console.log(result.err)
 * }
 * ```
 */
export type Result<T, E> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      err: E;
    };

/**
 * Works as a constructor for the "Ok" version of a Result. This is purely
 * syntactic sugar for the slightly less readable
 *
 * ```ts
 * {ok: true, data}
 * ```
 */
export function Ok<T>(data: T) {
  return {
    ok: true as const,
    data,
  };
}

/**
 * Works as a constructor for the "Err" version of a Result. This is purely
 * syntactic sugar for the slightly less readable
 * 
 * ```ts
 * {ok: false, err}
 * ```

 */
export function Err<E>(err: E) {
  return {
    ok: false as const,
    err,
  };
}
