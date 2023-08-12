import { api } from "~/utils/api";
import { useMemo } from "react";

export function useItemsInLists(listIds: string[]) {
  const listQueries = api.useQueries((t) =>
    listIds.map((listId) => t.lists.getList(listId))
  );

  const updatedAtString = listQueries.map((result) => result.dataUpdatedAt).join();

  return useMemo(
    () => listQueries.flatMap((result) => result.data?.items ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatedAtString]
  );
}
