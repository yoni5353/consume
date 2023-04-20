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
import { ProgressType } from "~/utils/progress";
import { Input } from "./ui/input";

export function ItemDisplay({ itemId }: { itemId: string }) {
  const { data: item, refetch } = api.items.getItem.useQuery(itemId);

  const { data: mediaTypes } = api.mediaTypes.getAll.useQuery();

  const { mutate: switchProgress } = api.items.switchProgress.useMutation({
    onSuccess: () => refetch(),
  });

  if (!item) return null;

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-2">
      <h3 className="mb-2 mt-0 scroll-m-20 truncate text-2xl font-semibold tracking-tight">
        {item.title}
      </h3>
      {item.link && (
        <a href={item.link} target="_blank" className="italic">
          {item.link}
        </a>
      )}
      {item.description && <p>{item.description}</p>}
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
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ProgressType.CHECK}>Check</SelectItem>
            <SelectItem value={ProgressType.SLIDER}>Slider</SelectItem>
            <SelectItem value={ProgressType.PERCENTAGE}>Precentage</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mx-5 flex flex-row items-center space-x-10">
        <Label className="items-center text-right uppercase">Media Type</Label>
        <Select
          value={item.mediaType?.id}
          onValueChange={(newValue) => {
            // noop
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue>{item.mediaType?.name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {mediaTypes?.map((mediaType) => (
              <SelectItem key={mediaType.id} value={mediaType.id}>
                {mediaType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col items-center">
        {item.progress.type === ProgressType.SLIDER && (
          <div className="mx-5 flex flex-row items-center space-x-10">
            <Label htmlFor="sliderAmount" className="items-center text-right uppercase">
              Slider Max Value
            </Label>
            <Input
              type="number"
              min={0}
              max={1000}
              id="sliderAmount"
              value={item.progress.maxValue}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                switchProgress({ itemId, newMaxValue: newValue });
              }}
            />
          </div>
        )}
      </div>
      <p className="text-slate-500">Created {moment(item.createdAt).fromNow()}</p>
    </div>
  );
}
