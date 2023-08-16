import { type Progress } from "@prisma/client";
import { z } from "zod";
import { ProgressType, defaultProgressMaxValues } from "../progress";

export const SwitchProgressSchema = z.object({
  newProgressType: z.optional(z.nativeEnum(ProgressType)),
  newMaxValue: z.optional(z.number().min(0)),
});

type SwitchProgreessSchemaType = z.infer<typeof SwitchProgressSchema>;

export function switchProgress(
  prevProgress: Progress,
  { newProgressType, newMaxValue }: SwitchProgreessSchemaType
) {
  if (newProgressType && newProgressType !== prevProgress.type) {
    const newCurrentValue =
      newProgressType === ProgressType.PERCENTAGE
        ? (prevProgress.currentValue / prevProgress.maxValue) * 100
        : 0;

    return {
      type: newProgressType,
      currentValue: newCurrentValue,
      maxValue: newMaxValue ?? defaultProgressMaxValues[newProgressType],
    };
  }

  return {
    currentValue: Math.min(prevProgress.currentValue, newMaxValue ?? 0),
    maxValue: newMaxValue ?? prevProgress.maxValue,
  };
}
