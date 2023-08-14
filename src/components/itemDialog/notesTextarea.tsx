import { useState } from "react";
import { Textarea, type TextareaProps } from "../ui/textarea";
import { TAG_REGEX } from "~/utils/items/tags";

export function NotesTextarea({ onChange, ...props }: TextareaProps) {
  const [value, setValue] = useState(
    typeof props.defaultValue === "string" ? props.defaultValue : ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(e);
  };

  const highlightedText = value.split(TAG_REGEX).map((part, index) => {
    if (index % 2 === 1) {
      return <span className="text-primary" key={index}>{`[${part}]`}</span>;
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
      <p className="pointer-events-none absolute inline-block overflow-hidden whitespace-pre-wrap px-[13px] py-[9px]">
        {highlightedText}
      </p>
    </div>
  );
}
