import { type Progress } from "@prisma/client";
import { ProgressBar } from "../ui/progress";
import { type ReactNode, useState, useEffect } from "react";
import { api } from "~/utils/api";
import { ProgressType } from "~/utils/progress";
import { Label } from "../ui/label";
import { ConSlider } from "../ui/con-slider";
import { cn } from "~/utils/ui/cn";
import { Checkbox } from "../ui/checkbox";

export function ProgressNode({
  progress,
  itemId,
  className,
}: {
  progress: Progress;
  itemId: string;
  className?: string;
}) {
  const [value, setValue] = useState(progress.currentValue);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const ctx = api.useContext();

  const { mutate: updateProgress } = api.items.updateProgress.useMutation({
    async onMutate({ newProgress }) {
      await ctx.items.getItem.cancel();
      ctx.items.getItem.setData(itemId, (prevItem) => {
        if (prevItem) {
          return {
            ...prevItem,
            progress: { ...prevItem.progress, currentValue: newProgress },
          };
        }
      });
    },
  });

  useEffect(() => {
    setValue(progress.currentValue);
  }, [progress.currentValue]);

  return (
    <div
      className={cn("flex h-full w-full items-center justify-center", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {progressTypeToDisplay[progress.type as ProgressType]?.({
        value,
        progress,
        isHovering,
        isDone: value === progress.maxValue,
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
    <Checkbox
      className="h-6 w-6 rounded-full"
      checked={value === 1}
      onCheckedChange={(checked) => {
        onValueChange(+checked);
        onValueCommit(+checked);
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
