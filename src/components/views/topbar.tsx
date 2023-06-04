import { Layout } from "lucide-react";
import { Consume } from "../ui/con-sume";
import { Toggle } from "../ui/toggle";

export function TopBar({
  onLayoutChange,
}: {
  onLayoutChange: (layout: "grid" | "list") => void;
}) {
  return (
    <div className="flex w-full flex-row items-center justify-between p-2">
      <div />
      <Consume className="text-2xl" />
      <div className="flex flex-row-reverse">
        <Toggle onPressedChange={(pressed) => onLayoutChange(pressed ? "grid" : "list")}>
          <Layout className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  );
}
