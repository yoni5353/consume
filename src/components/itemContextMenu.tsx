import {
  ContextMenuContent,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "~/components/ui/context-menu";
import {
  PlusCircle,
  ListIcon,
  Trash2,
  SplitSquareHorizontal,
  Share2,
  ClipboardCopy,
  BikeIcon,
  CircleSlashedIcon,
} from "lucide-react";
import { api } from "~/utils/api";

export function ItemContextMenu({
  itemsAmount,
  singleListId,
  areSelectedItemsCancelled,
  onCancel,
  onDelete,
  onMoveItems,
  onMoveItemsToNewList,
}: {
  itemsAmount: number;
  singleListId?: string;
  areSelectedItemsCancelled: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onMoveItems: (targetListId: string) => void;
  onMoveItemsToNewList: (originListId: string, isSprint: boolean) => void;
}) {
  const singleItem = itemsAmount === 1;

  const lists = api.lists.getBacklog
    .useQuery()
    .data?.filter((list) => list.id !== singleListId);

  const sprints = api.lists.getSprints
    .useQuery()
    .data?.filter((list) => list.id !== singleListId);

  return (
    <ContextMenuContent>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          {singleItem ? "Move to Sprint" : `Move ${itemsAmount} Items`}
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-36">
          <ContextMenuItem onClick={() => onMoveItemsToNewList(singleListId ?? "", true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Sprint
          </ContextMenuItem>
          {!!sprints?.length && (
            <>
              <ContextMenuSeparator />
              {sprints?.map((list) => (
                <ContextMenuItem key={list.id} onSelect={() => onMoveItems(list.id)}>
                  <BikeIcon className="mr-2 h-4 w-4" /> {list.title}
                </ContextMenuItem>
              ))}
            </>
          )}
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger>Move to Backlog</ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-36">
          <ContextMenuItem
            onClick={() => onMoveItemsToNewList(singleListId ?? "", false)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New list
          </ContextMenuItem>
          {!!lists?.length && (
            <>
              <ContextMenuSeparator />
              {lists?.map((list) => (
                <ContextMenuItem key={list.id} onSelect={() => onMoveItems(list.id)}>
                  <ListIcon className="mr-2 h-4 w-4" /> {list.title}
                </ContextMenuItem>
              ))}
            </>
          )}
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <ContextMenuItem onSelect={onCancel}>
        <CircleSlashedIcon className="mr-2 h-4 w-4" />
        {areSelectedItemsCancelled ? "Uncancel" : "Cancel"}
        {!singleItem && ` ${itemsAmount} Items`}
      </ContextMenuItem>

      <ContextMenuItem onSelect={onDelete}>
        <Trash2 className="mr-2 h-4 w-4" /> Delete
        {!singleItem && ` ${itemsAmount} Items`}
      </ContextMenuItem>

      {singleItem && (
        <ContextMenuItem>
          <SplitSquareHorizontal className="mr-2 h-4 w-4" /> Split
        </ContextMenuItem>
      )}

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Share2 className="mr-2 h-4 w-4" /> Share
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem>
            <ClipboardCopy className="mr-2 h-4 w-4" /> Copy link
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  );
}
