import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { api } from "~/utils/api";
import { useMemo, useState } from "react";
import { ColorSelector } from "./gradientPicker";
import { EraserIcon, InfoIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "~/utils/ui/cn";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

const DEFAULT_TAG_COLOR = "#FFFFFF";

export function TagsDialog() {
  const ctx = api.useContext();

  const { data: usedTags } = api.tags.getAllUserTags.useQuery();

  const { data: userTagColors } = api.tags.getUserTagColors.useQuery();

  const unusedTags = useMemo(
    () => Object.keys(userTagColors ?? {}).filter((tag) => !usedTags?.includes(tag)),
    [usedTags, userTagColors]
  );

  const { mutate: updateTagColor } = api.tags.updateTagColor.useMutation({
    onMutate: async ({ tag, color }) => {
      await ctx.tags.getUserTagColors.cancel();
      ctx.tags.getUserTagColors.setData(undefined, (prev) => ({ ...prev, [tag]: color }));
    },
  });

  const { mutate: removeTagColor } = api.tags.removeTagColor.useMutation({
    onMutate: async (tag) => {
      await ctx.tags.getUserTagColors.cancel();
      ctx.tags.getUserTagColors.setData(undefined, (prev) => {
        if (prev) {
          const { [tag]: _, ...rest } = prev;
          return rest;
        }
      });
    },
  });

  const hasTags = usedTags?.length || unusedTags?.length;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Tags</DialogTitle>
        <DialogDescription>Edit the display colors of your tags here</DialogDescription>
      </DialogHeader>
      {!hasTags ? (
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground">No tags yet</p>
          {/* TODO Add hint about tags */}
        </div>
      ) : (
        <>
          <div className="grid gap-x-4 gap-y-2 md:grid-cols-2">
            {usedTags?.map((tag) => (
              <TagBlock
                key={tag}
                tag={tag}
                initialColor={userTagColors?.[tag] ?? ""}
                onChangeComplete={(color) => updateTagColor({ tag, color })}
                onDelete={() => removeTagColor(tag)}
              />
            ))}
          </div>
          {!!unusedTags.length && (
            <>
              <div className="flex flex-row items-center gap-1 ">
                <div className="text-md font-semibold leading-none tracking-tight">
                  Unused tags
                </div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <InfoIcon className="mt-1 h-4 w-4 cursor-pointer text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p className="text-sm">
                      These tags were assigned a color but are not used on any item.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="grid gap-x-4 gap-y-2 md:grid-cols-2">
                {unusedTags?.map((tag) => (
                  <TagBlock
                    key={tag}
                    tag={tag}
                    initialColor={userTagColors?.[tag] ?? ""}
                    onChangeComplete={(color) => updateTagColor({ tag, color })}
                    onDelete={() => removeTagColor(tag)}
                    isUnused
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </DialogContent>
  );
}

function TagBlock({
  tag,
  initialColor,
  onChangeComplete,
  onDelete,
  isUnused,
}: {
  tag: string;
  initialColor: string;
  onChangeComplete: (color: string) => void;
  onDelete: () => void;
  isUnused?: boolean;
}) {
  const [color, setColor] = useState<string>(initialColor ?? DEFAULT_TAG_COLOR);

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center space-x-2">
        <div className={cn("text-sm", isUnused && "text-muted-foreground")}>{tag}</div>
      </div>
      <div className="flex flex-row items-center space-x-2">
        <ColorSelector
          color={color}
          onChange={setColor}
          onChangeComplete={onChangeComplete}
          className="w-4"
        />
        <Button
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => {
            setColor(DEFAULT_TAG_COLOR);
            onDelete();
          }}
        >
          {isUnused ? (
            <Trash2Icon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <EraserIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}
