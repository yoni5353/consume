import { type Progress } from "@prisma/client";
import { ProgressBar } from "../ui/progress";
import { type ReactNode, useState } from "react";
import { api } from "~/utils/api";
import { Slider } from "../ui/slider";
import { ProgressType } from "~/utils/progressType";

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
        progressTypeToDisplay[progress.type as ProgressType]?.({ progress }) ??
        defaultDisplay({ progress })
      )}
    </div>
  );
}

const defaultDisplay = ({ progress }: { progress: Progress }) => {
  return (
    <ProgressBar
      value={(progress.currentValue / progress.maxValue) * 100}
      className="w-24 border-[1px] border-slate-700"
    />
  );
};

const progressTypeToDisplay: {
  [key in ProgressType]?: ({ progress }: { progress: Progress }) => ReactNode;
} = {
  [ProgressType.CHECK]: ({ progress }) =>
    progress.currentValue > 0 ? "DONE" : "NOT DONE",
  [ProgressType.SLIDER]: ({ progress }) => (
    <ProgressBar
      value={(progress.currentValue / progress.maxValue) * 100}
      className="w-24 border-[1px] border-slate-700"
    />
  ),
};
