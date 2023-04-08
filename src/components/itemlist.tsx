import { api } from "~/utils/api";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export function ItemsList() {
  const { data: listWithItems } = api.lists.getWithItems.useQuery();

  const items = listWithItems?.items;

  return (
    <div className="flex flex-col gap-5">
      {items?.map((item) => (
        <Button className="flex w-[500px] justify-between gap-5 rounded-md bg-slate-900 px-5 py-1 text-left dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100">
          <div className="space-x-3">
            <span className="font-medium">{item.item.title}</span>
            <span className="text-slate-400">{item.item.description}</span>
          </div>
          <Progress value={30} className="w-24 border-[1px] border-slate-500" />
        </Button>
      ))}
    </div>
  );
}
