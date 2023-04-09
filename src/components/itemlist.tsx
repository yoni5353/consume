import { api } from "~/utils/api";
import { ItemCard } from "./itemcard";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm, SubmitHandler } from "react-hook-form";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { ItemContextMenu } from "./itemcontextmenu";

export function ItemsList({ listId }: { listId: string }) {
  const { register, handleSubmit, reset } = useForm<{ itemTitle: string }>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lastSelectedItem, setLastSelectedItem] = useState<string>();

  const onCreateItem: SubmitHandler<{ itemTitle: string }> = (data) => {
    addItem({
      listId,
      item: { title: data.itemTitle },
    });
    reset();
  };

  const { mutate: deleteItem } = api.items.deleteItem.useMutation({
    onSuccess: () => refetch(),
  });

  const { data: listWithItems, refetch } = api.lists.getWithItems.useQuery(
    listId,
    {
      onSuccess: () => {
        if (listWithItems && listWithItems.items[0]) {
          setLastSelectedItem(listWithItems.items[0].itemId);
        }
      },
    }
  );

  const { mutate: addItem } = api.lists.createItemInList.useMutation({
    onSuccess: () => refetch(),
  });

  const items = listWithItems?.items;

  if (!items) return null;

  const onCardClick = (e: React.MouseEvent, itemId: string) => {
    const newSelectedItem = itemId;
    if (e.ctrlKey) {
      setSelectedItems((prev) => {
        if (prev.includes(itemId)) {
          return prev.filter((id) => id !== itemId);
        } else {
          return [...prev, itemId];
        }
      });
    } else if (e.shiftKey) {
      if (lastSelectedItem) {
        const index = items.findIndex((item) => item.itemId === itemId);
        const firstIndex = items.findIndex(
          (item) => item.itemId === lastSelectedItem
        );
        if (~index && ~firstIndex) {
          const start = Math.min(index, firstIndex);
          const end = Math.max(index, firstIndex);
          const newSelectedItems = items
            .slice(start, end + 1)
            .map((item) => item.itemId);
          setSelectedItems((prev) => {
            return [...prev, ...newSelectedItems];
          });
        }
      }
    } else {
      setSelectedItems([itemId]);
    }
    if (!e.shiftKey) {
      setLastSelectedItem(newSelectedItem);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={handleSubmit(onCreateItem)}
        className="flex flex-row gap-2"
      >
        <Input {...register("itemTitle", { required: true, maxLength: 256 })} />
        <Button type="submit" variant="subtle" className="p-2">
          <Plus />
        </Button>
      </form>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="flex flex-col gap-2">
            {items?.map((item) => (
              <ItemCard
                item={item.item}
                key={item.itemId}
                selected={selectedItems.includes(item.itemId)}
                onClick={(e) => onCardClick(e, item.itemId)}
              />
            ))}
          </div>
        </ContextMenuTrigger>
        <ItemContextMenu
          itemsAmount={selectedItems.length}
          onDelete={() => {
            /* TODO */
          }}
        />
      </ContextMenu>
    </div>
  );
}
