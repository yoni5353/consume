import { type Progress, type Item } from "@prisma/client";
import { ProgressType } from "~/utils/progress";
import { useState } from "react";
import { api } from "~/utils/api";
import { TabsList, Tabs, TabsContent, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { ProgressBar } from "../ui/progress";
import Image from "next/image";
import stepsImage from "../../../public/images/progress/5steps/5steps-3.png";
import { ProgressNode } from "../progress/progressNode";
import { Input } from "../ui/input";
import { switchProgress as switchProgressUtil } from "~/utils/items/switchProgress";

export function ProgressEditor({ item }: { item: Item & { progress: Progress } }) {
  const [sliderValue, setSliderValue] = useState<number>();

  const ctx = api.useContext();

  const { mutate: switchProgress } = api.items.switchProgress.useMutation({
    onMutate: (vars) => {
      const newProgressProps = switchProgressUtil(item.progress, vars);
      ctx.items.getItem.setData(itemId, (prevItem) => {
        if (prevItem) {
          return {
            ...prevItem,
            progress: {
              ...prevItem.progress,
              ...newProgressProps,
            },
          };
        }
      });
    },
  });

  const itemId = item.id;

  return (
    <Tabs
      value={item.progress.type}
      onValueChange={(newValue) => {
        const newType = newValue as ProgressType;
        switchProgress({ itemId, newProgressType: newType });
      }}
    >
      <TabsList>
        <TabsTrigger value={ProgressType.CHECK}>
          <Checkbox checked={true} className="h-4 w-4 rounded-full" />
        </TabsTrigger>
        <TabsTrigger value={ProgressType.SLIDER}>
          <ProgressBar className="h-3 w-9 rounded-full" />
          <div className="absolute text-[10px]">a/b</div>
        </TabsTrigger>
        <TabsTrigger value={ProgressType.PERCENTAGE}>
          <ProgressBar className="h-3 w-9 rounded-full" />
          <div className="absolute text-[10px]">%</div>
        </TabsTrigger>
        <TabsTrigger value={ProgressType.STEPS}>
          <Image src={stepsImage} width={36} height={12} alt="steps progress" />
        </TabsTrigger>
      </TabsList>
      <div className="min-h-15 mt-2 flex flex-row items-center justify-evenly rounded-md bg-secondary px-4 py-2">
        <ProgressNode itemId={itemId} progress={item.progress} />
        <TabsContent className="mt-0 w-[40%]" value={ProgressType.SLIDER}>
          <Input
            type="number"
            min={0}
            max={1000}
            id="sliderAmount"
            value={sliderValue ?? item.progress.maxValue}
            onBlur={() => {
              switchProgress({ itemId, newMaxValue: sliderValue });
            }}
            onScroll={(e) => console.log(e)}
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              setSliderValue(newValue);
            }}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
