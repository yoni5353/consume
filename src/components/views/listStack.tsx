import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ItemsList } from "../itemsList";
import { api } from "~/utils/api";
import { useCallback } from "react";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import { ItemContextMenu } from "../itemContextMenu";
import { useToast } from "../ui/use-toast";
import { type ItemDragContext } from "./listPageContent";
import { useItemsInLists } from "~/utils/queries/useItemsInLists";
import { type ItemsInLists } from "@prisma/client";

export function ListStack({
  layout,
  onCreateSprint,
  selectedItems,
  onCardClick,
  dragContext,
}: {
  layout: "list" | "grid";
  onCreateSprint: () => void;
  selectedItems: string[];
  onCardClick: (event: React.MouseEvent, itemId: string) => void;
  dragContext?: ItemDragContext;
}) {
  const [sprintsViewRef] = useAutoAnimate<HTMLDivElement>();

  const ctx = api.useContext();

  const { toast } = useToast();

  const { data: sprints } = api.lists.getSprints.useQuery();

  const itemsInLists = useItemsInLists(sprints?.map((sprint) => sprint.id) ?? []);

  const areSelectedItemsCancelled = selectedItems.every(
    (itemId) => ctx.items.getItem.getData(itemId)?.status === "CANCELLED"
  );

  const { mutate: changeStatus } = api.items.changeStatus.useMutation({
    onMutate: ({ itemIds, newStatus }) => {
      itemIds.forEach((itemId) => {
        ctx.items.getItem.setData(itemId, (prevItem) => {
          if (prevItem) {
            return {
              ...prevItem,
              status: newStatus,
            };
          }
        });
      });
    },
  });

  const { mutate: deleteItems } = api.items.deleteItems.useMutation({
    async onMutate(itemIds) {
      const relatedLists = [
        ...new Set<string>(
          itemIds.flatMap((itemId) => {
            return itemsInLists.find((item) => item.itemId === itemId)?.listId ?? [];
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

  const { mutate: moveItems } = api.lists.moveItems.useMutation({
    onMutate: ({ targetListId, prevConnections }) => {
      const relatedLists = [targetListId].concat(
        ...new Set(prevConnections.map((c) => c.listId))
      );
      return { relatedLists };
    },
    onSuccess: (_, __, context) => {
      context?.relatedLists.forEach((listId) => {
        void ctx.lists.getList.invalidate(listId);
      });
    },
  });

  const originListsIds = [
    ...new Set(
      itemsInLists
        .filter((item) => selectedItems.includes(item.itemId))
        .map((item) => item.listId)
    ),
  ];

  const onCancelItems = useCallback(() => {
    const newStatus = areSelectedItemsCancelled ? "DEFAULT" : "CANCELLED";

    changeStatus({
      itemIds: selectedItems,
      newStatus,
    });
  }, [areSelectedItemsCancelled, changeStatus, selectedItems]);

  const onMoveItems = useCallback(
    (targetListId: string) => {
      const prevConnections = selectedItems
        .map((itemId) => itemsInLists.find((item) => item.itemId === itemId))
        .filter((connection): connection is ItemsInLists => !!connection);

      moveItems({
        targetListId,
        prevConnections,
      });
    },
    [itemsInLists, moveItems, selectedItems]
  );

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
              dragContext={dragContext}
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
        itemsAmount={selectedItems.length}
        areSelectedItemsCancelled={areSelectedItemsCancelled}
        onDelete={() => {
          deleteItems(selectedItems);
        }}
        onCancel={onCancelItems}
        onMoveItems={onMoveItems}
        onMoveItemsToNewList={(originListId, isSprint) => {
          // TODO
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
