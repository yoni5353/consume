import { type Progress } from "@prisma/client";
import { ProgressBar } from "../ui/progress";
import { cn } from "~/utils/ui/cn";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { ProgressNode } from "./progressNode";
import { ProgressType } from "~/utils/progress";
import { CheckIcon } from "lucide-react";
import { api } from "~/utils/api";
import { useState } from "react";
import { XIcon } from "lucide-react";

export function CircleProgress({
  progress,
  itemId,
  className,
}: {
  progress: Progress;
  itemId: string;
  className?: string;
}) {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [stopCheckHint, setStopCheckHint] = useState<boolean>(false);
  const isCheck = progress.type === ProgressType.CHECK;

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

  return (
    <HoverCard>
      <HoverCardTrigger
        onClick={() => {
          if (isCheck) {
            updateProgress({ itemId, newProgress: progress.currentValue ? 0 : 1 });
            setStopCheckHint(true);
          }
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setStopCheckHint(false);
        }}
      >
        {isCheck &&
          isHovering &&
          !stopCheckHint &&
          (!progress.currentValue ? (
            <CheckIcon
              className="absolute z-50 h-7 w-7 p-1"
              color="white"
              opacity={0.25}
            />
          ) : (
            <XIcon className="absolute z-50 h-7 w-7 p-1" color="white" opacity={0.25} />
          ))}
        <ProgressBar
          value={(progress.currentValue / progress.maxValue) * 100}
          className="h-7 w-7 border-[1px] border-slate-700"
          isDone={progress.currentValue >= progress.maxValue}
          isCircular
        />
      </HoverCardTrigger>
      {!isCheck && (
        <HoverCardContent className={cn("w-min", className)}>
          <ProgressNode progress={progress} itemId={itemId} />
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
