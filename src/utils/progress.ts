export enum ProgressType {
  CHECK = "check",
  SLIDER = "slider",
  PERCENTAGE = "precentage",
  STEPS = "steps",
}

export const defaultProgressMaxValues: { [key in ProgressType]: number } = {
  [ProgressType.CHECK]: 1,
  [ProgressType.SLIDER]: 10,
  [ProgressType.PERCENTAGE]: 100,
  [ProgressType.STEPS]: 5,
};
