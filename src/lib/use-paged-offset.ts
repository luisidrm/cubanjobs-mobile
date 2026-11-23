import { useState } from "react";

/**
 * Offset for "load more" lists. It returns to 0 on its own whenever `resetKey`
 * changes (a new search or filter), so callers never fetch page 3 of a
 * different query.
 *
 * `loaded` is how many items the list already holds; the next page starts there.
 */
export function usePagedOffset(resetKey: string) {
  const [state, setState] = useState({ key: resetKey, offset: 0 });
  if (state.key !== resetKey) setState({ key: resetKey, offset: 0 });
  const offset = state.key === resetKey ? state.offset : 0;

  return {
    offset,
    loadMore: (loaded: number) => setState({ key: resetKey, offset: loaded }),
    reset: () => setState({ key: resetKey, offset: 0 }),
  };
}
