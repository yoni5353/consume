import { type Progress } from "@prisma/client";
import { ProgressBar } from "../ui/progress";
import { type ReactNode, useState, useEffect } from "react";
import { api } from "~/utils/api";
import { ProgressType } from "~/utils/progress";
import { Label } from "../ui/label";
import { ConSlider } from "../ui/con-slider";

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
        isDone: progress.currentValue === progress.maxValue,
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
    isDone: boolean;
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
    isDone,
  }) => (
    <div className="flex flex-col items-center">
      <Label className="text-xs">
        {value} / {progress.maxValue}
      </Label>
      <div>
        {isHovering ? (
          <ConSlider
            className="w-24 rounded border-[1px] border-slate-100"
            value={[value]}
            onValueChange={(newValue) => onValueChange(newValue[0] ?? 0)}
            min={0}
            max={progress.maxValue}
            onValueCommit={(newValue) => onValueCommit(newValue[0] ?? 0)}
            isDone={isDone}
          />
        ) : (
          <ProgressBar
            value={(progress.currentValue / progress.maxValue) * 100}
            className="h-3 w-24 border-[1px] border-slate-700"
            isDone={isDone}
          />
        )}
      </div>
    </div>
  ),
  [ProgressType.PERCENTAGE]: ({
    value,
    progress,
    isHovering,
    onValueChange,
    onValueCommit,
    isDone,
  }) => (
    <>
      {isHovering ? (
        <ConSlider
          className="w-24 rounded border-[1px] border-slate-100"
          value={[value]}
          onValueChange={(newValue) => onValueChange(newValue[0] ?? 0)}
          min={0}
          max={progress.maxValue}
          onValueCommit={(newValue) => onValueCommit(newValue[0] ?? 0)}
          isDone={isDone}
          circularThumb
        />
      ) : (
        <ProgressBar
          value={(progress.currentValue / progress.maxValue) * 100}
          isDone={isDone}
          className="w-24 border-[1px] border-slate-700"
        />
      )}
    </>
  ),
};
