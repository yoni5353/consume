import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ItemsList } from "../itemsList";
import { api } from "~/utils/api";
import { useState } from "react";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import { ItemContextMenu } from "../itemContextMenu";
import { useToast } from "../ui/use-toast";

export function ListStack({
  layout,
  onCreateSprint,
}: {
  layout: "list" | "grid";
  onCreateSprint: () => void;
}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lastSelectedItem, setLastSelectedItem] = useState<string>();
  const [sprintsViewRef] = useAutoAnimate<HTMLDivElement>();

  const ctx = api.useContext();

  const { toast } = useToast();

  const { data: sprints } = api.lists.getSprints.useQuery();

  const { mutate: deleteItems } = api.items.deleteItems.useMutation({
    async onMutate(itemIds) {
      // await ctx.lists.getList.cancel(listId);
      // ctx.lists.getList.setData(listId, (prevList) => {
      //   if (prevList) {
      //     return {
      //       ...prevList,
      //       items: prevList.items.filter((item) => !itemIds.includes(item.itemId)),
      //     };
      //   }
      // });
    },
    onError: (err) => {
      toast({
        title: "Failed to delete items",
        description: err.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      // void ctx.lists.getList.invalidate(listId);
    },
  });

  const { mutate: moveItems } = api.items.moveItems.useMutation({
    onSuccess: (_, { targetListId }) => {
      // void ctx.lists.getList.invalidate(listId);
      // void ctx.lists.getList.invalidate(targetListId);
    },
  });

  if (!sprints) return null;

  const items = sprints.flatMap((sprint) => sprint.items);

  if (!lastSelectedItem && items[0]) {
    setLastSelectedItem(items[0].itemId);
  }

  const onCardClick = (e: React.MouseEvent, itemId: string) => {
    const auxClick = e.button === 1 || e.button === 2;

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
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="space-y-3" ref={sprintsViewRef}>
          {sprints?.map((sprint) => (
            <ItemsList
              key={sprint.id}
              layout={layout}
              listId={sprint.id}
              isSprint={true}
              selectedItems={selectedItems}
              onCardClick={onCardClick}
            />
          ))}
          <Button variant="ghost" onClick={onCreateSprint}>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create Sprint
          </Button>
        </div>
      </ContextMenuTrigger>
      <ItemContextMenu
        listId={""}
        // listId={listId}
        itemsAmount={selectedItems.length}
        onDelete={() => {
          // deleteItems(selectedItems);
        }}
        onMoveItems={(targetListId) => {
          // moveItems({ itemIds: selectedItems, targetListId });
        }}
        onMoveItemsToNewList={(originListId, isSprint) => {
          // return onMoveItemsToNewList?.(
          //   originListId,
          //   selectedItems.map((itemId) => itemId),
          //   isSprint
          // );
        }}
      />
    </ContextMenu>
  );
}
