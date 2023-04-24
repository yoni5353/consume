import { api } from "~/utils/api";
import { ProgressNode } from "./progress/progressNode";
import { Button } from "./ui/button";
import { cn } from "~/utils/ui/cn";
import { MediaTypeIcon } from "./resources/mediaTypeIcon";
import Image from "next/image";
import { CircleProgress } from "./progress/circleProgress";

export function ItemCard({
  itemId,
  onClick,
  onAuxClick,
  selected,
  layout,
}: {
  itemId: string;
  onClick?: (event: React.MouseEvent) => void;
  onAuxClick?: (event: React.MouseEvent) => void;
  selected: boolean;
  layout: "inline" | "card";
}) {
  const { data: item } = api.items.getItem.useQuery(itemId);

  if (!item) return null;

  const content =
    layout === "inline" ? (
      <div className="flex w-full flex-row justify-between px-2">
        <div className="flex items-center space-x-2">
          <MediaTypeIcon mediaType={item.mediaType ?? undefined} />
          {/* {item.image ? (
            <Image src={item.image} alt="Item image" width={20} height={30} />
          ) : (
            <div className="w-[20px]" />
          )} */}
          <div className="truncate font-medium">{item.title}</div>
        </div>
        <ProgressNode className="max-w-fit" progress={item.progress} itemId={item.id} />
      </div>
    ) : (
      <div className={"flex h-full w-full flex-col items-center justify-between"}>
        {item.image ? (
          <div className="relative h-32 w-full overflow-hidden">
            <Image
              src={item.image}
              alt="Item image"
              style={{ objectFit: "contain" }}
              fill={true}
            />
          </div>
        ) : (
          <div />
        )}
        <div className="vertical h-min text-center font-medium">{item.title}</div>
        <div className="flex w-full flex-row justify-between">
          <div />
          <CircleProgress
            className={cn("dark:bg-slate-700", selected && "dark:bg-slate-400")}
            progress={item.progress}
            itemId={item.id}
          />
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <Button
        onClick={onClick}
        onAuxClick={onAuxClick}
        onContextMenu={onAuxClick} // For context menu with keyboard
        className={cn(
          "bg-slate-900 p-2 dark:bg-slate-400",
          selected && "dark:hover:bg-slate-400 dark:hover:text-slate-800",
          !selected &&
            "dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100",
          layout === "inline" && "h-10",
          layout === "card" && "h-56"
        )}
      >
        {content}
      </Button>
    </div>
  );
}
