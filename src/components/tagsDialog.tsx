import { BlockPicker } from "react-color";
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

export function TagsDialog() {
  const { data: tags } = api.tags.getAllUserTags.useQuery();

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
        <div className="grid gap-2 md:grid-cols-2">
          {tags.map((tag) => (
            <TagBlock key={tag} tag={tag} />
          ))}
        </div>
      )}
      <DialogFooter></DialogFooter>
    </DialogContent>
  );
}

function TagBlock({ tag }: { tag: string }) {
  const [color, setColor] = useState<string>("");

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center space-x-2">
        <div className="text-sm">{tag}</div>
      </div>
      <div className="flex flex-row items-center space-x-2">
        <ColorSelector
          color={color}
          onChange={setColor}
          onChangeComplete={setColor}
          className="w-4"
        />
        <button className="text-sm text-muted-foreground">Reset</button>
      </div>
    </div>
  );
}
