import { Layout, LogOut, PaletteIcon, TagIcon, User, UserIcon } from "lucide-react";
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
import { GradientPicker } from "../gradientPicker";
import Link from "next/link";
import { TagsDialog } from "../tagsDialog";
import { Dialog, DialogTrigger } from "../ui/dialog";

export function TopBar({
  gradientColorsState,
  onLayoutChange,
}: {
  onLayoutChange: (layout: "grid" | "list") => void;
  gradientColorsState: [
    [string, string],
    React.Dispatch<React.SetStateAction<[string, string]>>
  ];
}) {
  const { data: sessionData } = useSession();

  const logout = () => {
    void signOut({ callbackUrl: "/" });
  };

  const userName = sessionData?.user?.name;
  const userEmail = sessionData?.user?.email;

  return (
    <div className="flex w-full flex-row items-center justify-between p-3 pl-6 md:p-2">
      <div className="hidden md:flex" />
      <Link href="/">
        <Consume className="text-2xl" />
      </Link>
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
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <TagIcon className="mr-2 h-4 w-4" />
                    <span>Tags</span>
                    <DropdownMenuShortcut>⇧T</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DialogTrigger>
                <TagsDialog />
              </Dialog>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex flex-col items-start gap-2">
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-row items-center">
                    <PaletteIcon className="mr-2 h-4 w-4" />
                    <span>Accent Gradient</span>
                  </div>
                  <div className="p-1 pt-2">
                    <GradientPicker
                      value={gradientColorsState[0]}
                      onChange={gradientColorsState[1]}
                    />
                  </div>
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
