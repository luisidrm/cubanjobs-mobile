type WithId = { id: string };
type Paged = { offset?: number };

/**
 * RTK Query options that turn a limit/offset endpoint into one growing list:
 * every page lives in the same cache entry (the key ignores `offset`), a new
 * offset fetches the next page, and it is appended without duplicates.
 *
 * Spread into an endpoint: `searchJobs: builder.query({ query, ...pagedList<Job, JobSearchFilters>() })`
 */
export function pagedList<T extends WithId, A extends Paged>() {
  return {
    serializeQueryArgs: ({ endpointName, queryArgs }: { endpointName: string; queryArgs: A }) => {
      const { offset: _offset, ...rest } = queryArgs;
      return `${endpointName}(${JSON.stringify(rest)})`;
    },
    // Page 1 replaces the list (new search, pull-to-refresh); later pages are
    // upserted by id so a refetch of the last page can't create duplicates.
    merge: (current: T[] | undefined, incoming: T[], { arg }: { arg: A }): T[] => {
      if (!arg.offset || !current) return incoming;
      const fresh = new Map(incoming.map((item) => [item.id, item]));
      const merged = current.map((item) => fresh.get(item.id) ?? item);
      const known = new Set(current.map((item) => item.id));
      return [...merged, ...incoming.filter((item) => !known.has(item.id))];
    },
    forceRefetch: ({ currentArg, previousArg }: { currentArg?: A; previousArg?: A }) =>
      currentArg?.offset !== previousArg?.offset,
  };
}
