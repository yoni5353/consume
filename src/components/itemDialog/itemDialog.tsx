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
import { MediaTypeIcon } from "../resources/mediaTypeIcon";
import dayjs from "dayjs";
import { useCallback } from "react";
import { throttle } from "lodash";
import { ProgressEditor } from "./progressEditor";
import { ItemDialogDropdown } from "./itemDialogDropdown";
import { format } from "date-fns";
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
    <div className="flex h-full flex-col gap-4 overflow-hidden px-1">
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

      {/* BODY */}
      <div className="relative grid grid-cols-1 gap-2 gap-x-10 md:grid-cols-2">
        <div className="absolute left-[50%] hidden h-[100%] w-0.5 rounded-full bg-muted md:block"></div>

        {/* PROGRESS */}
        <div className="flex flex-col items-center gap-2">
          <Label className="text-center font-mono text-sm lowercase">progress</Label>
          <ProgressEditor item={item} />
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
