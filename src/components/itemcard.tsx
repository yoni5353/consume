import { api } from "~/utils/api";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Item } from "@prisma/client";

export function ItemCard({ item }: { item: Item }) {
  return (
    <div className="flex flex-col gap-5">
      <Button className="flex w-[500px] justify-between gap-5 rounded-md bg-slate-900 px-5 py-1 text-left dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100">
        <div className="space-x-3">
          <span className="font-medium">{item.title}</span>
          <span className="text-slate-400">{item.description}</span>
        </div>
        <Progress value={30} className="w-24 border-[1px] border-slate-500" />
      </Button>
    </div>
  );
}
