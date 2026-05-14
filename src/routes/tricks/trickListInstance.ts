// Module-level instance counter so multiple TrickList instances (e.g. across
// dev-mode HMR transitions or future routes) get unique teleport target
// prefixes and do not collide on DOM element ids.
let counter = 0;

export function nextTrickListInstanceId(): string {
  return `tl${++counter}`;
}
