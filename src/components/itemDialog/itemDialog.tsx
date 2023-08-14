/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { MediaTypeIcon } from "../resources/mediaTypeIcon";
import dayjs from "dayjs";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "../ui/badge";
import { throttle } from "lodash";
import { ProgressEditor } from "./progressEditor";
import { ItemDialogDropdown } from "./itemDialogDropdown";
import { format } from "date-fns";
import { ProgressNode } from "../progress/progressNode";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu";
import { SettingsIcon } from "lucide-react";
import { getTags } from "~/utils/items/tags";
import { NotesTextarea } from "./notesTextarea";

export function ItemDialog({ itemId }: { itemId: string }) {
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

  const { mutate: editItem } = api.items.editItem.useMutation({
    async onMutate({ mediaTypeId, title, notes, link, image, tags }) {
      await ctx.items.getItem.cancel(itemId);
      ctx.items.getItem.setData(itemId, (prevItem) => {
        if (prevItem) {
          const newItem = {
            ...prevItem,
            ...(title && { title }),
            ...(notes && { notes }),
            ...(link && { link }),
            ...(image && { image }),
            ...(tags && {
              tags: tags.map((tag) => ({
                name: tag,
                itemId,
              })),
            }),
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onNotesCommit = useCallback(
    throttle(
      (notes: string) => {
        const tags = getTags(notes);
        editItem({ itemId, notes, tags });
      },
      500,
      { leading: false, trailing: true }
    ),
    [editItem, itemId]
  );

  if (!item) return null;

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden px-1">
      {/* SETTINGS  */}
      <div className="absolute right-10 top-3.5">
        <ItemDialogDropdown item={item} />
      </div>

      {/* TITLE */}
      <h3 className="mb-2 mt-0 scroll-m-20 truncate text-2xl font-semibold tracking-tight">
        {item.title}
      </h3>

      {/* LINK */}
      {item.link && (
        <a href={item.link} target="_blank" className="italic">
          {item.link}
        </a>
      )}

      {/* NOTES */}
      <NotesTextarea
        id="notes"
        className="font-light tracking-wide"
        defaultValue={item.notes}
        onChange={(e) => onNotesCommit(e.target.value)}
      />

      <div className="h-4"></div>

      {/* BODY */}
      <div className="relative mx-4 grid grid-cols-2 gap-2 gap-x-10">
        <div className="absolute left-[50%] h-[100%] w-0.5 rounded-full bg-muted"></div>

        {/* PROGRESS */}
        <div className="flex flex-row items-center space-x-4">
          <Label className="w-[25%] items-center text-right font-mono lowercase">
            Progress
          </Label>
          <div className="flex h-full w-full flex-row items-center justify-between gap-1">
            <ProgressNode
              progress={item.progress}
              itemId={item.id}
              className="rounded-lg bg-accent/20 p-2"
            />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="rounded-full p-2">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-2">
                <ProgressEditor item={item} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* MEDIA TYPE */}
        <div className="flex flex-row items-center space-x-4">
          <Label className="w-[25%] items-center text-right font-mono lowercase">
            Media Type
          </Label>
          <Select
            value={item.mediaType?.id?.toString() ?? "0"}
            onValueChange={(newMediaTypeId) => {
              const mediaTypeId = parseInt(newMediaTypeId);
              editItem({ itemId, mediaTypeId: mediaTypeId || null });
            }}
          >
            <SelectTrigger className="w-full">
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

        {/* TAGS */}
        <TagSelection itemId={item.id} />
      </div>

      {/* FOOTER */}
      <p
        className="text-sm text-slate-500"
        title={format(item.createdAt, "'Created at' P H:mm")}
      >
        Created {dayjs(item.createdAt).fromNow()}
      </p>
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
      <div className="flex flex-row items-center space-x-4">
        <Label
          htmlFor="newTag"
          className="w-[25%] items-center text-right font-mono lowercase"
        >
          Add Tag
        </Label>
        <Input
          className="w-32"
          type="text"
          id="newTag"
          {...register("newTag", { required: true, maxLength: 32 })}
        />
      </div>
      <div className="flex flex-row items-center space-x-4">
        <Label
          htmlFor="newTag"
          className="w-[25%] items-center text-right font-mono lowercase"
        >
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
