import {
  CreditCard,
  Layout,
  LogOut,
  PlusCircle,
  Settings,
  User,
  UserIcon,
} from "lucide-react";
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
import { useSession } from "next-auth/react";

export function TopBar({
  onLayoutChange,
}: {
  onLayoutChange: (layout: "grid" | "list") => void;
}) {
  const { data: sessionData } = useSession();

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
            <DropdownMenuSeparator />
            <DropdownMenuItem>
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
