import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Item } from "@prisma/client";
import {
  PlusCircle,
  ListIcon,
  ClipboardCopy,
  Trash2,
  SplitSquareHorizontal,
  Share2,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "./ui/context-menu";
import { cn } from "~/utils/ui/cn";

const listsMock = ["toread", "towatch"];

export function ItemCard({
  item,
  onDelete,
  onClick,
  selected,
}: {
  item: Item;
  onDelete: () => void;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  selected: boolean;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex flex-col gap-5">
          <Button
            onClick={onClick}
            className={cn(
              "flex w-[50vw] justify-between gap-5 rounded-md bg-slate-900 px-5 py-1 text-left dark:bg-slate-300",
              selected && "dark:hover:bg-slate-400 dark:hover:text-slate-800",
              !selected &&
                "dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            )}
          >
            <div className="space-x-3">
              <span className="font-medium">{item.title}</span>
              <span className="text-slate-400">{item.description}</span>
            </div>
            <Progress
              value={30}
              className="w-24 border-[1px] border-slate-500"
            />
          </Button>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Move to List</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-36">
            <ContextMenuItem>
              <PlusCircle className="mr-2 h-4 w-4" />
              New list
            </ContextMenuItem>
            <ContextMenuSeparator />
            {listsMock.map((list) => (
              <ContextMenuItem key={list}>
                <ListIcon className="mr-2 h-4 w-4" /> {list}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>Copy to List</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-36">
            <ContextMenuItem>
              <PlusCircle className="mr-2 h-4 w-4" />
              New list
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
        </ContextMenuItem>

        <ContextMenuItem>
          <SplitSquareHorizontal className="mr-2 h-4 w-4" /> Split
        </ContextMenuItem>

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
    </ContextMenu>
  );
}
