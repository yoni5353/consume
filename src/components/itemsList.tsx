/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import { ItemCard } from "./itemCard";
import { useState } from "react";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { ItemContextMenu } from "./itemContextMenu";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cn } from "~/utils/ui/cn";

export function ItemsList({
  listId,
  onItemSelected,
  onMoveItemsToNewList,
  layout,
  isSprint,
}: {
  listId: string;
  onItemSelected: (itemId: string) => void;
  onMoveItemsToNewList?: (originListId: string, itemIds: string[]) => void;
  layout: "list" | "grid";
  isSprint?: boolean;
}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lastSelectedItem, setLastSelectedItem] = useState<string>();
  const [listRef] = useAutoAnimate<HTMLDivElement>();

  const { data: listWithItems, refetch } = api.lists.getWithItems.useQuery(listId, {
    onSuccess: () => {
      if (listWithItems?.items[0] && !lastSelectedItem) {
        setLastSelectedItem(listWithItems.items[0].itemId);
      }
    },
  });

  const { mutate: deleteItems } = api.items.deleteItems.useMutation({
    onSuccess: () => refetch(),
  });

  const { mutate: moveItems } = api.items.moveItems.useMutation({
    onSuccess: () => refetch(),
  });

  const items = listWithItems?.items;

  if (!items) return null;

  const onCardClick = (e: React.MouseEvent, itemId: string, auxClick = false) => {
    onItemSelected(itemId);

    // Selection logic
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
        const firstIndex = items.findIndex((item) => item.itemId === lastSelectedItem);
        if (~index && ~firstIndex) {
          const start = Math.min(index, firstIndex);
          const end = Math.max(index, firstIndex);
          const newSelectedItems = items.slice(start, end + 1).map((item) => item.itemId);
          setSelectedItems((prev) => {
            return [...new Set([...prev, ...newSelectedItems])];
          });
        }
      }
    } else {
      if (!(auxClick && selectedItems.includes(itemId))) {
        setSelectedItems([itemId]);
      }
    }
    if (!e.shiftKey) {
      setLastSelectedItem(newSelectedItem);
    }
  };

  return (
    <div className="items-list flex flex-col gap-3">
      {isSprint && <h2 className="font-bold uppercase">{listWithItems.title}</h2>}
      <ContextMenu modal={false}>
        <ContextMenuTrigger>
          <div
            className={cn(
              "items flex flex-col gap-2",
              layout === "grid" && "grid grid-cols-3 gap-5 xl:grid-cols-6"
            )}
            ref={listRef}
          >
            {items?.map((item) => (
              <ItemCard
                key={item.itemId}
                itemId={item.itemId}
                layout={layout === "grid" ? "card" : "inline"}
                selected={selectedItems.includes(item.itemId)}
                onClick={(e) => onCardClick(e, item.itemId)}
                onAuxClick={(e) => onCardClick(e, item.itemId, true)}
              />
            ))}
          </div>
        </ContextMenuTrigger>
        <ItemContextMenu
          listId={listId}
          itemsAmount={selectedItems.length}
          onDelete={() => {
            deleteItems(selectedItems);
          }}
          onMoveItems={(targetListId) => {
            moveItems({ itemIds: selectedItems, targetListId });
          }}
          onMoveItemsToNewList={(originListId) =>
            onMoveItemsToNewList?.(
              originListId,
              selectedItems.map((itemId) => itemId)
            )
          }
        />
      </ContextMenu>
    </div>
  );
}
