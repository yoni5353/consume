import { spaceTrim } from "~/utils/general/spaceTrim";

export const TAG_REGEX = /\[([^\]]+)\]/g;

export function getTags(notes: string): string[] {
  return (
    [...new Set(notes.match(TAG_REGEX)?.map((tag) => spaceTrim(tag.slice(1, -1))))] ?? []
  );
}
