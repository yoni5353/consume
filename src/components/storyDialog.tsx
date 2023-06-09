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
import { sortBy } from "lodash";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AspectRatio } from "./ui/aspect-ratio";

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

  const sortedSeries = sortBy(story.series, [(series) => (series.main ? 0 : 1)]);

  return (
    <Dialog {...dialogProps} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "1000px" }}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{story.title}</DialogTitle>
          <DialogDescription>{story.description}</DialogDescription>
        </DialogHeader>
        {sortedSeries.map((series) => (
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
    <div className="flex flex-col gap-2 overflow-hidden">
      <div className="text-md font-semibold leading-none">{series.title}</div>
      <div className="text-sm text-muted-foreground">{series.description}</div>
      <ScrollArea type="auto">
        <div className="flex flex-row gap-4 pb-3">
          {series.templates.map((template) => (
            <TemplateDisplay
              key={template.id}
              template={template}
              onAddItem={onAddItem}
              main={series.main}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

function TemplateDisplay({
  template,
  onAddItem,
  main,
}: {
  template: ItemTemplate;
  onAddItem?: (templateId: string) => void;
  main: boolean;
}) {
  const [isHovering, setIsHovering] = useState(false);

  const width = main ? 125 : 110;

  return (
    <div
      className="relative flex cursor-pointer flex-col items-center gap-1 rounded-md bg-secondary/80 text-center"
      style={{ width }}
      tabIndex={0}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onAddItem?.(template.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onAddItem?.(template.id);
        }
      }}
    >
      <div
        className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-md"
        style={{ width }}
      >
        <AspectRatio ratio={6 / 9}>
          <Image
            src={template.image}
            width={width}
            height={100}
            alt={`'${template.title}' template image`}
            className={cn("select-none transition-all", isHovering && "scale-105")}
          />
        </AspectRatio>
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
