import { useQuery } from "@tanstack/react-query";
import { api } from "~/utils/api";

export function ItemsList() {
  const { data: items } = api.lists.getWithItems.useQuery();

  return (
    <div>
      <pre>{JSON.stringify(items, null, 4)}</pre>
    </div>
  );
}
