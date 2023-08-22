import { useState } from "react";
import { Textarea, type TextareaProps } from "../ui/textarea";
import { TAG_REGEX } from "~/utils/items/tags";
import { api } from "~/utils/api";
import { DEFAULT_TAG_COLOR } from "~/styles/colors";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { Button } from "../ui/button";
import { EraserIcon } from "lucide-react";
import { Badge } from "../ui/badge";

export function NotesTextarea({ onChange, ...props }: TextareaProps) {
  const [value, setValue] = useState(
    typeof props.defaultValue === "string" ? props.defaultValue : ""
  );

  const { data: userTagColors } = api.tags.getUserTagColors.useQuery();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(e);
  };

  const highlightedText = value.split(TAG_REGEX).map((part, index) => {
    if (index % 2 === 1) {
      const color = userTagColors?.[part] ?? DEFAULT_TAG_COLOR;
      return <TagSpan key={index} tag={part} color={color} />;
    }
    return (
      <span className="opacity-0" key={index}>
        {part}
      </span>
    );
  });

  return (
    <div className="relative flex text-sm font-light tracking-wide">
      <Textarea
        className="text-red-100"
        value={value}
        onChange={handleChange}
        {...props}
      />
      <div className="pointer-events-none absolute inline-block overflow-hidden whitespace-pre-wrap px-[13px] py-[9px]">
        {highlightedText}
      </div>
    </div>
  );
}

function TagSpan({ tag, color }: { tag: string; color: string }) {
  return (
    <HoverCard openDelay={250} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span
          className="underline-offset-3 pointer-events-auto hover:underline"
          style={{ color }}
        >{`[${tag}]`}</span>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="flex w-min flex-row items-center gap-1 p-2">
        <Badge className="h-min px-[5px] py-0" style={{ backgroundColor: color }}>
          {tag}
        </Badge>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <EraserIcon className="h-4 w-4" />
        </Button>
      </HoverCardContent>
    </HoverCard>
  );
}
