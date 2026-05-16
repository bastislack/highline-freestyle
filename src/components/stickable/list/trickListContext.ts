import type { InjectionKey } from 'vue';

export type TrickListRefresh = () => void | Promise<void>;

// Provided by the trick list view so descendants (e.g. the long-press
// stick-frequency popover) can request a re-fetch of the cached trick array
// after they commit a change. Without this, the list's section grouping
// keeps using the stale value until the next KeepAlive reactivation, so a
// trick whose stick frequency just changed stays in its old section even
// though the card colour already reflects the new value.
export const trickListRefreshKey: InjectionKey<TrickListRefresh> = Symbol('trickListRefresh');
