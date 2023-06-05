import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { BlockPicker } from "react-color";
import { cn } from "~/utils/ui/cn";

export function GradientPicker({
  value,
  onChange,
}: {
  value: [string, string];
  onChange: (value: [string, string]) => void;
}) {
  const [colorOne, setColorOne] = useState<string>("red");
  const [colorTwo, setColorTwo] = useState<string>("white");

  return (
    <div className="w-full">
      <div className="flex w-full flex-row gap-1">
        <ColorSelector color={colorOne} onChange={setColorOne} className="rounded-l" />
        <div
          className="h-4 w-full"
          style={{
            backgroundImage: `linear-gradient(to right, ${colorOne}, ${colorTwo})`,
          }}
        />
        <ColorSelector color={colorTwo} onChange={setColorTwo} className="rounded-r" />
      </div>
    </div>
  );
}

function ColorSelector({
  color,
  onChange,
  className,
}: {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(className, "h-4 w-24 cursor-pointer")}
          style={{ backgroundColor: `${color}` }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" sideOffset={12}>
        <BlockPicker
          width="175px"
          color={color}
          onChange={({ hex }) => onChange(hex)}
          styles={{
            default: {
              head: { border: "1D283A solid 5px" },
              body: {
                backgroundColor: "#030711",
                borderRadius: "0 0 4px 4px",
                border: "#1D283A solid 1px",
              },
            },
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
