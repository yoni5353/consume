import { type MediaType } from "@prisma/client";
import { AxeIcon, BookIcon, BoxIcon } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "~/utils/ui/cn";

export function MediaTypeIcon({
  mediaType,
  className,
}: {
  mediaType?: MediaType;
  className?: string;
}) {
  const icon = (mediaType && defaultIconByNames[mediaType.name]) ?? defaultIcon;
  return <div className={cn("h-4 w-4", className)}>{icon}</div>;
}

const defaultIconByNames: { [name: string]: ReactNode } = {
  Book: <BookIcon size={16} visibility={0} />,
  Anime: <AxeIcon size={16} />,
};

const defaultIcon: ReactNode = <BoxIcon size={16} />;
