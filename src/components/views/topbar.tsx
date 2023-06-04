import { Layout, UserIcon } from "lucide-react";
import { Consume } from "../ui/con-sume";
import { Toggle } from "../ui/toggle";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function TopBar({
  onLayoutChange,
}: {
  onLayoutChange: (layout: "grid" | "list") => void;
}) {
  return (
    <div className="flex w-full flex-row items-center justify-between p-2">
      <div />
      <Consume className="text-2xl" />
      <div className="mr-1 flex flex-row-reverse gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/yoni5353.png" alt="@yonisku" />
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            Content
          </DropdownMenuContent>
        </DropdownMenu>
        <Toggle onPressedChange={(pressed) => onLayoutChange(pressed ? "grid" : "list")}>
          <Layout className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  );
}
