import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ItemsList } from "../itemsList";
import { api } from "~/utils/api";
import { useCallback, useState } from "react";
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

  const items = sprints?.flatMap((sprint) => sprint.items) ?? [];

  const { mutate: deleteItems } = api.items.deleteItems.useMutation({
    async onMutate(itemIds) {
      const relatedLists = [
        ...new Set<string>(
          itemIds.flatMap((itemId) => {
            return items.find((item) => item.itemId === itemId)?.listId ?? [];
          })
        ),
      ];

      await Promise.all(relatedLists.map((listId) => ctx.lists.getList.cancel(listId)));

      relatedLists.forEach((listId) => {
        ctx.lists.getList.setData(listId, (prevList) => {
          if (prevList) {
            return {
              ...prevList,
              items: prevList.items.filter((item) => !itemIds.includes(item.itemId)),
            };
          }
        });
      });

      return { relatedLists };
    },
    onError: (err) => {
      toast({
        title: "Failed to delete items",
        description: err.message,
        variant: "destructive",
      });
    },
    onSettled: async (_, __, ___, context) => {
      const affectedLists = context?.relatedLists ?? [];
      await Promise.all(
        affectedLists.map((listId) => ctx.lists.getList.invalidate(listId))
      );
    },
  });

  const { mutate: moveItems } = api.items.moveItems.useMutation({
    onMutate: () => {
      const originListId = items.find((item) => item.itemId === selectedItems[0])?.listId;
      return { originListId };
    },
    onSuccess: (_, { targetListId }, context) => {
      void ctx.lists.getList.invalidate(context?.originListId);
      void ctx.lists.getList.invalidate(targetListId);
    },
  });

  const originListsIds = [
    ...new Set(
      items
        .filter((item) => selectedItems.includes(item.itemId))
        .map((item) => item.listId)
    ),
  ];

  const onMoveItems = useCallback(
    (targetListId: string) => {
      if (originListsIds.length > 1) {
        // TODO
        toast({
          title: "Not implemented",
          description: "Cannot move items from different lists",
          variant: "destructive",
        });
        return;
      }

      moveItems({
        targetListId,
        itemIds: selectedItems,
      });
    },
    [moveItems, originListsIds.length, selectedItems, toast]
  );

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
        singleListId={originListsIds.length === 1 ? originListsIds[0] : undefined}
        // listId={listId}
        itemsAmount={selectedItems.length}
        onDelete={() => {
          deleteItems(selectedItems);
        }}
        onMoveItems={onMoveItems}
        onMoveItemsToNewList={(originListId, isSprint) => {
          toast({
            title: "Not implemented",
            description: "Turning this off as originListId needs to change",
            variant: "destructive",
          });
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
