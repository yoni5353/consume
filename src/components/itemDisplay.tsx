import { api } from "~/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import moment from "moment";
import { Label } from "./ui/label";
import { ProgressType } from "~/utils/progressType";

export function ItemDisplay({ itemId }: { itemId: string }) {
  const { data: item, refetch } = api.items.getItem.useQuery(itemId);

  const { mutate: switchProgress } = api.items.switchProgressType.useMutation({
    onSuccess: () => refetch(),
  });

  if (!item) return null;

  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden p-2">
      <h3 className="mt-8 scroll-m-20 truncate text-2xl font-semibold tracking-tight">
        {item.title}
      </h3>
      {item.description && <p>{item.description}</p>}
      <p className="text-slate-500">Created {moment(item.createdAt).fromNow()}</p>
      <div className="mx-5 flex flex-row items-center space-x-10">
        <Label htmlFor="progressType" className="items-center text-right uppercase">
          Progress Type
        </Label>
        <Select
          value={item.progress.type}
          onValueChange={(newValue) => {
            const newType = newValue as ProgressType;
            switchProgress({ itemId, newProgressType: newType });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ProgressType.CHECK}>Check</SelectItem>
            <SelectItem value={ProgressType.SLIDER}>Slider</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
