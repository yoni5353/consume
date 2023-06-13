import { type MediaType } from "@prisma/client";
import {
  AxeIcon,
  BookIcon,
  BoxIcon,
  CatIcon,
  ClapperboardIcon,
  type LucideProps,
  TvIcon,
} from "lucide-react";
import { cn } from "~/utils/ui/cn";

export function MediaTypeIcon({
  mediaType,
  className,
}: {
  mediaType?: MediaType;
  className?: string;
}) {
  const Icon =
    (mediaType && defaultIconByNames[mediaType.name.toLowerCase()]) ?? defaultIcon;
  return (
    <div className={cn("h-4 w-4", className)}>
      <Icon size={16} />
    </div>
  );
}

type IconProps = LucideProps;

const defaultIconByNames: { [name: string]: (props: IconProps) => JSX.Element } = {
  book: BookIcon,
  "tv series": TvIcon,
  movie: ClapperboardIcon,
  anime: AxeIcon,
};

const defaultIcon = BoxIcon;

export const mediaTypeIcons = Object.values(defaultIconByNames).concat([
  BoxIcon,
  CatIcon,
]);
