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

  const hasOptions = item.progress.type === ProgressType.SLIDER;

  return (
    <div className="flex flex-col gap-4">
      {/* TYPE */}
      <div className="flex flex-row items-center gap-5">
        <Label
          htmlFor="progressType"
          className="w-[25%] items-center text-center font-mono"
        >
          type
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

      {/* OPTIONS */}
      {hasOptions && (
        <div className="flex flex-col items-center">
          {item.progress.type === ProgressType.SLIDER && (
            <div className="flex flex-row items-center gap-5">
              <Label
                htmlFor="sliderAmount"
                className="w-[25%] items-center text-center font-mono"
              >
                Max Value
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
      )}
    </div>
  );
}
