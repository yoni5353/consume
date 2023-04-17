import { type Progress } from "@prisma/client";
import { ProgressBar } from "../ui/progress";
import { type ReactNode, useState } from "react";
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
      {!isEditing
        ? progressTypeToDisplay[progress.type as ProgressType]?.display({
            progress,
            value,
          }) ?? defaultDisplay({ progress })
        : progressTypeToDisplay[progress.type as ProgressType]?.editor({
            value,
            progress,
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
  [key in ProgressType]?: {
    display: (props: { progress: Progress; value: number }) => ReactNode;
    editor: (props: {
      value: number;
      progress: Progress;
      onValueChange: (newValue: number) => void;
      onValueCommit: (newValue: number) => void;
    }) => ReactNode;
  };
} = {
  [ProgressType.CHECK]: {
    display: ({ value }) => (
      <input className="h-6 w-6" type="checkbox" checked={value === 1} readOnly />
    ),
    editor: ({ value, onValueChange, onValueCommit }) => (
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
  },
  [ProgressType.SLIDER]: {
    display: ({ progress }) => (
      <ProgressBar
        value={(progress.currentValue / progress.maxValue) * 100}
        className="w-24 border-[1px] border-slate-700"
      />
    ),
    editor: ({ value, progress, onValueChange, onValueCommit }) => (
      <Slider
        className="w-24 rounded border-[1px] border-slate-100"
        value={[value]}
        onValueChange={(newValue) => onValueChange(newValue[0] ?? 0)}
        min={0}
        max={progress.maxValue}
        onValueCommit={(newValue) => onValueCommit(newValue[0] ?? 0)}
      />
    ),
  },
  [ProgressType.PERCENTAGE]: {
    display: ({ progress }) => (
      <ProgressBar
        value={(progress.currentValue / progress.maxValue) * 100}
        className="w-24 border-[1px] border-slate-700"
      />
    ),
    editor: ({ value, progress, onValueChange, onValueCommit }) => (
      <Slider
        className="w-24 rounded border-[1px] border-slate-100"
        value={[value]}
        onValueChange={(newValue) => onValueChange(newValue[0] ?? 0)}
        min={0}
        max={progress.maxValue}
        onValueCommit={(newValue) => onValueCommit(newValue[0] ?? 0)}
      />
    ),
  },
};
