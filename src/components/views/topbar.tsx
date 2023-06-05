import { Layout, LogOut, PaletteIcon, Settings, User, UserIcon } from "lucide-react";
import { Consume } from "../ui/con-sume";
import { Toggle } from "../ui/toggle";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { HuePicker } from "react-color";
import { useState } from "react";

export function TopBar({
  onLayoutChange,
}: {
  onLayoutChange: (layout: "grid" | "list") => void;
}) {
  const [color, setColor] = useState<string>("red");

  const { data: sessionData } = useSession();

  const logout = () => {
    void signOut({ callbackUrl: "/" });
  };

  const userName = sessionData?.user?.name;
  const userEmail = sessionData?.user?.email;

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
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <DropdownMenuShortcut>⇧S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <div className="flex flex-row">
                  <PaletteIcon className="mr-2 h-4 w-4" />
                  <span>Accent Color</span>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="w-full px-2 py-1">
                  <HuePicker
                    color={color}
                    onChange={({ hex }) => setColor(hex)}
                    onChangeComplete={({ hex }) => console.log(hex)}
                    width="100%"
                  />
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Toggle onPressedChange={(pressed) => onLayoutChange(pressed ? "grid" : "list")}>
          <Layout className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  );
}
