import { api } from "~/utils/api";
import { ProgressNode } from "./progress/progressNode";
import { Button } from "./ui/button";
import { cn } from "~/utils/ui/cn";
import { MediaTypeIcon } from "./resources/mediaTypeIcon";
import Image from "next/image";

export function ItemCard({
  itemId,
  onClick,
  onAuxClick,
  selected,
}: {
  itemId: string;
  onClick?: (event: React.MouseEvent) => void;
  onAuxClick?: (event: React.MouseEvent) => void;
  selected: boolean;
}) {
  const { data: item } = api.items.getItem.useQuery(itemId);

  if (!item) return null;

  return (
    <div className="flex flex-col gap-5">
      <Button
        onClick={onClick}
        onAuxClick={onAuxClick}
        onContextMenu={onAuxClick} // For context menu with keyboard
        className={cn(
          "flex justify-between gap-5 rounded-md bg-slate-900 px-3 py-1 text-left dark:bg-slate-500",
          selected && "dark:hover:bg-slate-400 dark:hover:text-slate-800",
          !selected &&
            "dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100"
        )}
      >
        <div className="flex items-center space-x-2">
          <MediaTypeIcon mediaType={item.mediaType ?? undefined} />
          {item.image ? (
            <Image src={item.image} alt="Item image" width={20} height={30} />
          ) : (
            <div className="w-[20px]" />
          )}
          <div className="truncate font-medium">{item.title}</div>
        </div>
        <ProgressNode progress={item.progress} itemId={item.id} />
      </Button>
    </div>
  );
}
