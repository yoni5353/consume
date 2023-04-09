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
} from "lucide-react";
import { api } from "~/utils/api";

export function ItemContextMenu({
  itemsAmount,
  listId,
  onDelete,
  onMoveItems,
}: {
  itemsAmount: number;
  listId: string;
  onDelete: () => void;
  onMoveItems: (targetListId: string) => void;
}) {
  const singleItem = itemsAmount === 1;

  const lists = api.lists.getUserLists
    .useQuery()
    .data?.filter((list) => list.id !== listId);

  return (
    <ContextMenuContent>
      <ContextMenuSub>
        <ContextMenuSubTrigger>Move to List</ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-36">
          <ContextMenuItem>
            <PlusCircle className="mr-2 h-4 w-4" />
            New list
          </ContextMenuItem>
          <ContextMenuSeparator />
          {lists?.map((list) => (
            <ContextMenuItem key={list.id} onSelect={() => onMoveItems(list.id)}>
              <ListIcon className="mr-2 h-4 w-4" /> {list.title}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

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
