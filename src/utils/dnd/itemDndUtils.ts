import { type Active, type Over } from "@dnd-kit/core";
import { get } from "lodash";

export function getDroppableType(over: Over | Active | null) {
  return get(over, "data.current.type") as "list" | "nav-list" | undefined;
}

export function getOverIndex(over: Over | null) {
  const overType = getDroppableType(over);
  if (overType === "list" || overType === "nav-list") return 0;

  const overIndex = get(over, "data.current.sortable.index") as number | undefined;
  if (typeof overIndex !== "number") throw Error("Could not find overIndex");
  return overIndex;
}

export function getOverListId(over: Over | Active | null) {
  const overType = getDroppableType(over);
  if (overType === "list" || overType === "nav-list") {
    return over?.id as string;
  }

  const containerId = get(over, "data.current.sortable.containerId") as
    | number
    | undefined;
  if (typeof containerId !== "string") throw Error("Could not find containerId");

  return containerId;
}
