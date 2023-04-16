import { type Progress } from "@prisma/client";
import { ProgressBar } from "../ui/progress";

export function ProgressNode({ progress }: { progress: Progress }) {
  return (
    <div>
      <ProgressBar
        value={progress.currentValue}
        className="w-24 border-[1px] border-slate-500"
      />
    </div>
  );
}
