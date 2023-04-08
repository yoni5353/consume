import { api } from "~/utils/api";
import { ItemCard } from "./itemcard";
import { Input } from "./ui/input";
import { useState } from "react";
import { Button } from "./ui/button";

export function ItemsList({ listId }: { listId: string }) {
  const [newTitle, setNewTitle] = useState("");
  const { data: listWithItems, refetch } =
    api.lists.getWithItems.useQuery(listId);
  const { mutate: addItem } = api.lists.createItemInList.useMutation({
    onSuccess: () => refetch(),
  });

  const items = listWithItems?.items;

  return (
    <div className="flex flex-col gap-3">
      <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
      <Button
        onClick={() => {
          addItem({
            listId,
            item: { title: newTitle },
          });
          setNewTitle("");
        }}
      >
        +
      </Button>
      {items?.map((item) => (
        <ItemCard item={item.item} key={item.itemId} />
      ))}
    </div>
  );
}
