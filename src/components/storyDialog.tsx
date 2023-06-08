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

export function StoryDialog({
  storyId,
  ...dialogProps
}: { storyId: string } & DialogProps) {
  const { data: story } = api.templates.getStory.useQuery(storyId);

  if (!story) {
    return null;
  }

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="w-[1000px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{story.title}</DialogTitle>
          <DialogDescription>{story.description}</DialogDescription>
        </DialogHeader>
        {story.series.map((series) => (
          <SeriesDisplay key={series.id} series={series} />
        ))}
      </DialogContent>
    </Dialog>
  );
}

type SeriesWithTemplates = Series & { templates: ItemTemplate[] };

function SeriesDisplay({ series }: { series: SeriesWithTemplates }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-md font-semibold leading-none">{series.title}</div>
      <div className="text-sm">{series.description}</div>
      <div className="flex flex-row gap-4">
        {series.templates.map((template) => (
          <TemplateDisplay key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

function TemplateDisplay({ template }: { template: ItemTemplate }) {
  return (
    <div className="flex max-w-[125px] flex-col items-center gap-1 rounded-md bg-secondary/80 text-center">
      <div className="overflow-hidden rounded-md">
        <Image
          src={template.image}
          width={125}
          height={100}
          alt={`'${template.title}' template image`}
          className="object-cover transition-all hover:scale-105"
        />
      </div>
      <div className="flex flex-row items-center space-x-1 p-1">
        {/* <MediaTypeIcon mediaType={null ?? "book"} /> */}
        <div className="text-sm font-semibold">{template.title}</div>
      </div>
    </div>
  );
}
