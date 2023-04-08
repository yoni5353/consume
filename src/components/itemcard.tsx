import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Item } from "@prisma/client";
import { PlusCircle, List as ListIcon, ClipboardCopy } from "lucide-react";
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

const listsMock = ["toread", "towatch"];

export function ItemCard({ item }: { item: Item }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex flex-col gap-5">
          <Button className="flex w-[500px] justify-between gap-5 rounded-md bg-slate-900 px-5 py-1 text-left dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100">
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
          <ContextMenuSubContent className="w-48">
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
          <ContextMenuSubContent className="w-48">
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

        <ContextMenuItem>Delete</ContextMenuItem>

        <ContextMenuItem>Split</ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
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
