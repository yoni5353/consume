import { api } from "~/utils/api";
import { ProgressNode } from "./progress/progressNode";
import { Button } from "./ui/button";
import { cn } from "~/utils/ui/cn";
import { MediaTypeIcon } from "./resources/mediaTypeIcon";
import Image from "next/image";
import { CircleProgress } from "./progress/circleProgress";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent } from "./ui/dialog";
import { ItemDisplay } from "./itemDisplay";
import { useState } from "react";
import { AspectRatio } from "./ui/aspect-ratio";

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
  const [showDialog, setShowDialog] = useState(false);

  const { data: item } = api.items.getItem.useQuery(itemId, {
    refetchOnWindowFocus: false,
  });

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
          <div className="space-x-2">
            {item.tags.map((tag) => (
              <Badge key={tag.name} className="px-[5px] py-0">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
        <ProgressNode className="max-w-fit" progress={item.progress} itemId={item.id} />
      </div>
    ) : (
      <div className="relative flex h-full w-full cursor-pointer flex-col items-center justify-between text-center">
        {/* IMAGE */}
        {!!item.image ? (
          <div className="relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-t-md">
            <AspectRatio ratio={6 / 9}>
              <Image
                src={item.image}
                fill={true}
                alt={`image for '${item.title}'`}
                className="select-none object-cover"
              />
            </AspectRatio>
          </div>
        ) : (
          <div />
        )}
        {/* TITLE */}
        <div className="vertical h-min p-1 pb-0 text-center font-medium">
          {item.title}
        </div>
        {/* DETAILS */}
        <div className="flex w-full flex-col items-center gap-1 p-1">
          <div className="flex w-full flex-row items-center justify-between px-1">
            <div className="flex flex-row items-center space-x-1">
              <MediaTypeIcon mediaType={item.mediaType ?? undefined} />
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag.name} className="px-[5px] py-0">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            <CircleProgress
              className={cn("dark:bg-slate-700", selected && "dark:bg-slate-400")}
              progress={item.progress}
              itemId={item.id}
            />
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <Button
        onClick={onClick}
        onAuxClick={onAuxClick}
        onContextMenu={onAuxClick} // For context menu with keyboard
        onDoubleClick={() => setShowDialog(true)}
        className={cn(
          "bg-secondary text-primary hover:bg-accent",
          selected && "bg-primary/70 text-secondary hover:bg-primary/80",
          layout === "inline" && "h-10 p-2",
          layout === "card" && "h-64 w-[130px] rounded-lg p-0"
        )}
      >
        {content}
      </Button>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <ItemDisplay itemId={item.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
