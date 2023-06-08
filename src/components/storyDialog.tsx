import { type ItemTemplate, type Series } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { type DialogProps } from "@radix-ui/react-dialog";
import { api } from "~/utils/api";
import Image from "next/image";
import { useCallback, useState } from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "~/utils/ui/cn";

export function StoryDialog({
  storyId,
  onCreateItem,
  onOpenChange,
  ...dialogProps
}: { storyId: string; onCreateItem: (templateId: string) => void } & DialogProps) {
  const { data: story } = api.templates.getStory.useQuery(storyId);

  const onAddItem = useCallback(
    (templateId: string) => {
      onCreateItem(templateId);
      onOpenChange?.(false);
    },
    [onCreateItem, onOpenChange]
  );

  if (!story) {
    return null;
  }

  return (
    <Dialog {...dialogProps} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1000px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{story.title}</DialogTitle>
          <DialogDescription>{story.description}</DialogDescription>
        </DialogHeader>
        {story.series.map((series) => (
          <SeriesDisplay key={series.id} series={series} onAddItem={onAddItem} />
        ))}
      </DialogContent>
    </Dialog>
  );
}

type SeriesWithTemplates = Series & { templates: ItemTemplate[] };

function SeriesDisplay({
  series,
  onAddItem,
}: {
  series: SeriesWithTemplates;
  onAddItem?: (templateId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-md font-semibold leading-none">{series.title}</div>
      <div className="text-sm">{series.description}</div>
      <div className="flex flex-row gap-4">
        {series.templates.map((template) => (
          <TemplateDisplay key={template.id} template={template} onAddItem={onAddItem} />
        ))}
      </div>
    </div>
  );
}

function TemplateDisplay({
  template,
  onAddItem,
}: {
  template: ItemTemplate;
  onAddItem?: (templateId: string) => void;
}) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="relative flex max-w-[125px] cursor-pointer flex-col items-center gap-1 rounded-md bg-secondary/80 text-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onAddItem?.(template.id)}
    >
      <div className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-md">
        <Image
          src={template.image}
          width={125}
          height={100}
          alt={`'${template.title}' template image`}
          className={cn("transition-all", isHovering && "scale-105")}
        />
        {isHovering && (
          <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <PlusIcon size={24} color="lightgrey" />
          </div>
        )}
      </div>
      {isHovering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30" />
      )}
      <div className="flex flex-row items-center space-x-1 p-1">
        {/* <MediaTypeIcon mediaType={null ?? "book"} /> */}
        <div className="text-sm font-semibold">{template.title}</div>
      </div>
    </div>
  );
}
