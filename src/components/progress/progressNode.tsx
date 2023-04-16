import { type Progress } from "@prisma/client";
import { ProgressBar } from "../ui/progress";
import { useState } from "react";
import { api } from "~/utils/api";
import { Slider } from "../ui/slider";

export function ProgressNode({
  progress,
  itemId,
}: {
  progress: Progress;
  itemId: string;
}) {
  const [value, setValue] = useState(progress.currentValue);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const ctx = api.useContext();

  const { mutate: updateProgress } = api.items.updateProgress.useMutation({
    onSuccess: () => ctx.items.getItem.invalidate(itemId),
  });

  return (
    <div
      className="flex h-full w-24 items-center justify-center"
      onMouseEnter={() => setIsEditing(true)}
      onMouseLeave={() => setIsEditing(false)}
    >
      {isEditing ? (
        <Slider
          className="w-24 rounded border-[1px] border-slate-700"
          value={[value]}
          onValueChange={(newValue) => setValue(newValue[0] ?? 0)}
          min={0}
          max={progress.maxValue}
          onValueCommit={() => updateProgress({ itemId, newProgress: value })}
        />
      ) : (
        <ProgressBar
          value={(progress.currentValue / progress.maxValue) * 100}
          className="w-24 border-[1px] border-slate-700"
        />
      )}
    </div>
  );
}

const progressTypeToDisplay = {
  
}