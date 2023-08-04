import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ItemsList } from "../itemsList";
import { api } from "~/utils/api";
import { useCallback } from "react";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import { ItemContextMenu } from "../itemContextMenu";
import { useToast } from "../ui/use-toast";

export function ListStack({
  layout,
  onCreateSprint,
  selectedItems,
  onCardClick,
  hiddenItems,
}: {
  layout: "list" | "grid";
  onCreateSprint: () => void;
  selectedItems: string[];
  onCardClick: (event: React.MouseEvent, itemId: string) => void;
  hiddenItems: string[];
}) {
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
              hiddenItems={hiddenItems}
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
