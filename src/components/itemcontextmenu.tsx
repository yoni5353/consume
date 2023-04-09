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

const listsMock = ["toread", "towatch"];

export function ItemContextMenu({
  onDelete,
  itemsAmount,
}: {
  onDelete: () => void;
  itemsAmount: number;
}) {
  const singleItem = itemsAmount === 1;

  return (
    <ContextMenuContent>
      <ContextMenuSub>
        <ContextMenuSubTrigger>Move to List</ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-36">
          <ContextMenuItem>
            <PlusCircle className="mr-2 h-4 w-4" />
            New list {itemsAmount}
          </ContextMenuItem>
          <ContextMenuSeparator />
          {listsMock.map((list) => (
            <ContextMenuItem key={list}>
              <ListIcon className="mr-2 h-4 w-4" /> {list}
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
