import { type Progress, type Item } from "@prisma/client";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { ProgressType } from "~/utils/progress";
import { useState } from "react";
import { api } from "~/utils/api";
import { Input } from "../ui/input";

export function ProgressEditor({ item }: { item: Item & { progress: Progress } }) {
  const [sliderValue, setSliderValue] = useState<number>();

  const ctx = api.useContext();

  const { mutate: switchProgress } = api.items.switchProgress.useMutation({
    onSuccess: () => ctx.items.getItem.refetch(),
  });

  const itemId = item.id;

  return (
    <div>
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
              value={sliderValue ?? item.progress.maxValue}
              onBlur={() => {
                switchProgress({ itemId, newMaxValue: sliderValue });
              }}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                setSliderValue(newValue);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
