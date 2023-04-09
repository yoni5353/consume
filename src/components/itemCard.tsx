import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Item } from "@prisma/client";
import { cn } from "~/utils/ui/cn";

export function ItemCard({
  item,
  onClick,
  selected,
}: {
  item: Item;
  onClick?: (event: React.MouseEvent) => void;
  selected: boolean;
}) {
  return (
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
        <Progress value={30} className="w-24 border-[1px] border-slate-500" />
      </Button>
    </div>
  );
}
