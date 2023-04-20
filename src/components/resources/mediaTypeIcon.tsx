import { type MediaType } from "@prisma/client";
import { AxeIcon, BookIcon, BoxIcon, ClapperboardIcon, TvIcon } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "~/utils/ui/cn";

export function MediaTypeIcon({
  mediaType,
  className,
}: {
  mediaType?: MediaType;
  className?: string;
}) {
  const icon =
    (mediaType && defaultIconByNames[mediaType.name.toLowerCase()]) ?? defaultIcon;
  return <div className={cn("h-4 w-4", className)}>{icon}</div>;
}

const defaultIconByNames: { [name: string]: ReactNode } = {
  book: <BookIcon size={16} />,
  "tv series": <TvIcon size={16} />,
  movie: <ClapperboardIcon size={16} />,
  anime: <AxeIcon size={16} />,
};

const defaultIcon: ReactNode = <BoxIcon size={16} />;
