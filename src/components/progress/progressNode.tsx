import { type Progress } from "@prisma/client";
import { ProgressBar } from "../ui/progress";
import { type ReactNode, useState, useEffect } from "react";
import { api } from "~/utils/api";
import { Slider } from "../ui/slider";
import { ProgressType } from "~/utils/progress";

export function ProgressNode({
  progress,
  itemId,
}: {
  progress: Progress;
  itemId: string;
}) {
  const [value, setValue] = useState(progress.currentValue);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const ctx = api.useContext();

  const { mutate: updateProgress } = api.items.updateProgress.useMutation({
    onSuccess: () => ctx.items.getItem.invalidate(itemId),
  });

  useEffect(() => {
    setValue(progress.currentValue);
  }, [progress.currentValue]);

  return (
    <div
      className="flex h-full w-24 items-center justify-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {progressTypeToDisplay[progress.type as ProgressType]?.({
        value,
        progress,
        isHovering: isHovering,
        onValueChange: (newValue) => setValue(newValue),
        onValueCommit: (newValue) => {
          return updateProgress({ itemId, newProgress: newValue });
        },
      }) ?? defaultDisplay({ progress })}
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
  [key in ProgressType]?: (props: {
    isHovering: boolean;
    value: number;
    progress: Progress;
    onValueChange: (newValue: number) => void;
    onValueCommit: (newValue: number) => void;
  }) => ReactNode;
} = {
  [ProgressType.CHECK]: ({ value, onValueChange, onValueCommit }) => (
    <input
      className="h-6 w-6"
      type="checkbox"
      checked={value === 1}
      onChange={(e) => {
        onValueChange(e.target.checked ? 1 : 0);
        onValueCommit(e.target.checked ? 1 : 0);
      }}
    />
  ),
  [ProgressType.SLIDER]: ({
    value,
    progress,
    isHovering,
    onValueChange,
    onValueCommit,
  }) => (
    <>
      {isHovering ? (
        <Slider
          className="w-24 rounded border-[1px] border-slate-100"
          value={[value]}
          onValueChange={(newValue) => onValueChange(newValue[0] ?? 0)}
          min={0}
          max={progress.maxValue}
          onValueCommit={(newValue) => onValueCommit(newValue[0] ?? 0)}
        />
      ) : (
        <ProgressBar
          value={(progress.currentValue / progress.maxValue) * 100}
          className="w-24 border-[1px] border-slate-700"
        />
      )}
    </>
  ),
  [ProgressType.PERCENTAGE]: ({
    value,
    progress,
    isHovering,
    onValueChange,
    onValueCommit,
  }) => (
    <>
      {isHovering ? (
        <Slider
          className="w-24 rounded border-[1px] border-slate-100"
          value={[value]}
          onValueChange={(newValue) => onValueChange(newValue[0] ?? 0)}
          min={0}
          max={progress.maxValue}
          onValueCommit={(newValue) => onValueCommit(newValue[0] ?? 0)}
        />
      ) : (
        <ProgressBar
          value={(progress.currentValue / progress.maxValue) * 100}
          className="w-24 border-[1px] border-slate-700"
        />
      )}
    </>
  ),
};
