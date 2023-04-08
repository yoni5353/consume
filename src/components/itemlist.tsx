import { api } from "~/utils/api";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ItemCard } from "./itemcard";

export function ItemsList() {
  const { data: listWithItems } = api.lists.getWithItems.useQuery();

  const items = listWithItems?.items;

  return (
    <div className="flex flex-col gap-3">
      {items?.map((item) => (
        <ItemCard item={item.item} />
      ))}
    </div>
  );
}
