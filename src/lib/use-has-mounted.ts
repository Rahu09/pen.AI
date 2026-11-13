import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during the server render and the browser's first (hydrating) render,
 * true afterwards. For UI that depends on browser-only facts (theme, screen
 * width) and must not differ from the server's HTML.
 *
 * useSyncExternalStore picks the server snapshot while hydrating and the
 * client snapshot after, so this needs no effect that sets state.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
