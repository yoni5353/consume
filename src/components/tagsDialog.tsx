import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { api } from "~/utils/api";
import { useState } from "react";
import { ColorSelector } from "./gradientPicker";
import { EraserIcon } from "lucide-react";
import { Button } from "./ui/button";

const DEFAULT_TAG_COLOR = "#FFFFFF";

export function TagsDialog() {
  const { data: tags } = api.tags.getAllUserTags.useQuery();

  const { data: userTagColors } = api.tags.getUserTagColors.useQuery();

  const { mutate: updateTagColor } = api.tags.updateTagColor.useMutation();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Tags</DialogTitle>
        <DialogDescription>Edit the display colors of your tags here</DialogDescription>
      </DialogHeader>
      {!tags?.length ? (
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground">No tags yet</p>
          {/* TODO Add hint about tags */}
        </div>
      ) : (
        <div className="grid gap-x-4 gap-y-2 md:grid-cols-2">
          {tags.map((tag) => (
            <TagBlock
              key={tag}
              tag={tag}
              initialColor={userTagColors?.[tag] ?? ""}
              onChangeComplete={(color) => updateTagColor({ tag, color })}
            />
          ))}
        </div>
      )}
      <DialogFooter></DialogFooter>
    </DialogContent>
  );
}

function TagBlock({
  tag,
  initialColor,
  onChangeComplete,
}: {
  tag: string;
  initialColor: string;
  onChangeComplete: (color: string) => void;
}) {
  const [color, setColor] = useState<string>(initialColor ?? DEFAULT_TAG_COLOR);

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center space-x-2">
        <div className="text-sm">{tag}</div>
      </div>
      <div className="flex flex-row items-center space-x-2">
        <ColorSelector
          color={color}
          onChange={setColor}
          onChangeComplete={onChangeComplete}
          className="w-4"
        />
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EraserIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
