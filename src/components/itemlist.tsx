import { api } from "~/utils/api";
import { ItemCard } from "./itemcard";

export function ItemsList({ listId }: { listId: string }) {
  const { data: listWithItems } = api.lists.getWithItems.useQuery(listId);

  const items = listWithItems?.items;

  return (
    <div className="flex flex-col gap-3">
      {items?.map((item) => (
        <ItemCard item={item.item} />
      ))}
    </div>
  );
}
