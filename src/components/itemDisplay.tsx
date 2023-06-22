/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { MediaTypeIcon } from "./resources/mediaTypeIcon";
import dayjs from "dayjs";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShieldIcon } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { throttle } from "lodash";
import { Textarea } from "./ui/textarea";
import { ProgressEditor } from "./itemDialog/progressEditor";

export function ItemDisplay({ itemId }: { itemId: string }) {
  const { data: item } = api.items.getItem.useQuery(itemId, {
    /*
     * Prevent refetching when selecting different items. Caused a problem where it would
     * override the progress optimistic update when clicking the check of a different
     * item. (Updating and selecting it at once.)
     */
    staleTime: Infinity,
  });

  const { data: mediaTypes } = api.mediaTypes.getAll.useQuery();

  const ctx = api.useContext();

  const { toast } = useToast();

  const { mutate: editItem } = api.items.editItem.useMutation({
    async onMutate({ mediaTypeId, title, description, link, image }) {
      await ctx.items.getItem.cancel(itemId);
      ctx.items.getItem.setData(itemId, (prevItem) => {
        if (prevItem) {
          const newItem = {
            ...prevItem,
            ...(title && { title }),
            ...(description && { description }),
            ...(link && { link }),
            ...(image && { image }),
          };

          const newMediaType = mediaTypes?.find((mt) => mt.id === mediaTypeId);

          if (!mediaTypeId || !newMediaType) {
            return { ...newItem, mediaTypeId: null, mediaType: null };
          }

          return {
            ...newItem,
            mediaTypeId,
            mediaType: { ...prevItem.mediaType, ...newMediaType },
          };
        }
      });
    },
  });

  const { mutate: generateTemplate } = api.templates.createTemplateFromItem.useMutation({
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "A template was created from this item.",
      });
    },
    onError: (error) => {
      toast({
        title: "Template creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onDescriptionCommit = useCallback(
    throttle(
      (description: string) => {
        editItem({ itemId, description });
      },
      500,
      { leading: false, trailing: true }
    ),
    [editItem, itemId]
  );

  if (!item) return null;

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-2">
      <h3 className="mb-2 mt-0 scroll-m-20 truncate text-2xl font-semibold tracking-tight">
        {item.title}
      </h3>
      {item.link && (
        <a href={item.link} target="_blank" className="italic">
          {item.link}
        </a>
      )}

      {/* DESCRIPTION */}
      <Textarea
        id="description"
        className="font-light tracking-wide"
        defaultValue={item.description}
        onChange={(e) => onDescriptionCommit(e.target.value)}
      />

      {/* MEDIA TYPE */}
      <div className="mx-5 flex flex-row items-center space-x-10">
        <Label className="items-center text-right uppercase">Media Type</Label>
        <Select
          value={item.mediaType?.id?.toString() ?? "0"}
          onValueChange={(newMediaTypeId) => {
            const mediaTypeId = parseInt(newMediaTypeId);
            editItem({ itemId, mediaTypeId: mediaTypeId || null });
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue>
              <div className="flex items-center">
                <MediaTypeIcon
                  mediaType={item?.mediaType ?? undefined}
                  className="mr-2"
                />
                {item.mediaType?.name ?? "None"}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">
              <div className="flex items-center space-x-2">
                <MediaTypeIcon mediaType={undefined} className="mr-2" />
                None
              </div>
            </SelectItem>
            {mediaTypes?.map((mediaType) => (
              <SelectItem key={mediaType.id} value={mediaType.id.toString()}>
                <div className="flex items-center space-x-2">
                  <MediaTypeIcon mediaType={mediaType} className="mr-2" />
                  {mediaType.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* PROGRESS */}
      <ProgressEditor item={item} />

      {/* TAGS */}
      <TagSelection itemId={item.id} />

      <p className="text-slate-500">Created {dayjs(item.createdAt).fromNow()}</p>
      <Button
        onClick={() =>
          generateTemplate({
            ...item,
            progressType: item.progress.type,
            tags: item.tags.map((tag) => tag.name),
            mediaTypeId: item.mediaType?.id ?? undefined,
          })
        }
      >
        <ShieldIcon className="mr-2" />
        GENERATE TEMPLATE
      </Button>
    </div>
  );
}

function TagSelection({ itemId }: { itemId: string }) {
  const { register, handleSubmit, reset } = useForm<{ newTag: string }>({});

  const { data: item } = api.items.getItem.useQuery(itemId);

  const ctx = api.useContext();

  const { mutate: editItem } = api.items.editItem.useMutation({
    onMutate: ({ tags: newTags }) => {
      void ctx.items.getItem.cancel(itemId);
      ctx.items.getItem.setData(itemId, (prevItem) => {
        if (prevItem && newTags) {
          return {
            ...prevItem,
            tags: [...new Set(newTags)]
              .sort()
              .map((tag) => ({ name: tag, itemId: prevItem.id })),
          };
        }
      });
    },
  });

  return (
    <form
      onSubmit={handleSubmit(({ newTag }) => {
        if (item) {
          const trimmedTag = newTag.trim();
          const prevTags = item.tags.map((tag) => tag.name);
          editItem({ itemId, tags: [...prevTags, trimmedTag] });
          reset();
        }
      })}
      className="space-y-5"
    >
      <div className="mx-10 flex flex-row items-center space-x-4">
        <Label htmlFor="newTag" className="items-center text-right uppercase">
          Add Tag
        </Label>
        <Input
          className="w-32"
          type="text"
          id="newTag"
          {...register("newTag", { required: true, maxLength: 32 })}
        />
      </div>
      <div className="mx-10 flex flex-row items-center space-x-4">
        <Label htmlFor="newTag" className="items-center text-right uppercase">
          Remove Tag
        </Label>
        {item?.tags.map((tag) => (
          <Badge
            key={tag.name}
            className="hover:cursor-pointer"
            onClick={() => {
              if (item) {
                const prevTags = item.tags.map((t) => t.name);
                editItem({ itemId, tags: prevTags.filter((t) => t !== tag.name) });
                reset();
              }
            }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </form>
  );
}
