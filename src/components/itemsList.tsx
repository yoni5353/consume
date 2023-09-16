/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import { useCallback, useMemo, useState } from "react";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { cn } from "~/utils/ui/cn";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { type DateRange } from "react-day-picker";
import { format, formatDistance } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ListContextMenu } from "./listContextMenu";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItemCard } from "./itemCard";
import { type ItemDragContext } from "./views/listPageContent";
import { useDroppable } from "@dnd-kit/core";

export function ItemsList({
  listId,
  onCardClick,
  selectedItems,
  layout,
  isSprint,
  dragContext,
}: {
  listId: string;
  onCardClick: (e: React.MouseEvent, itemId: string) => void;
  selectedItems: string[];
  layout: "list" | "grid";
  isSprint?: boolean;
  dragContext?: ItemDragContext;
}) {
  const { data: list, refetch } = api.lists.getList.useQuery(listId, {
    refetchOnWindowFocus: false,
  });

  const { mutate: editList } = api.lists.editList.useMutation({
    onSuccess: () => refetch(),
  });

  const items = list?.items;

  const { setNodeRef } = useDroppable({
    id: listId,
    data: {
      type: "list",
    },
    disabled: !!items?.length,
  });

  const [date, setDate] = useState<DateRange>();

  const onSetDate = useCallback(
    (date?: DateRange) => {
      setDate(date);
      editList({ id: listId, startDate: date?.from, dueDate: date?.to ?? null });
    },
    [editList, listId]
  );

  const sortableItemIds = useMemo(
    () =>
      getSortableItemIdsConsideringDragContext(
        listId,
        items?.map((item) => item.itemId) ?? [],
        dragContext
      ),
    [listId, items, dragContext]
  );

  if (!list) return null;

  return (
    <div className="items-list flex flex-col" ref={setNodeRef} id={`list-${list.id}`}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex flex-row gap-2 space-y-1 pb-3">
            <h2 className="font-bold uppercase">{list.title}</h2>
            <div className="flex flex-row text-gray-500">
              {isSprint && (
                <Popover>
                  <PopoverTrigger className="flex flex-row text-xs hover:cursor-pointer hover:underline">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    {!list.dueDate && <div className="absolute h-4 w-4">/</div>}
                    {list.dueDate && (
                      <div>
                        {format(list.startDate, "LLL dd")} -{" "}
                        {format(list.dueDate, "LLL dd")}
                        {list.dueDate > new Date() ? (
                          <> ({formatDistance(list.dueDate, new Date())} left)</>
                        ) : (
                          <> ({formatDistance(list.dueDate, new Date())} overdue)</>
                        )}
                      </div>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" sideOffset={10}>
                    <Calendar
                      initialFocus
                      mode="range"
                      selected={date}
                      onSelect={onSetDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        <ListContextMenu selectedListId={listId} isSprint={isSprint} />
      </ContextMenu>
      <SortableContext
        items={sortableItemIds}
        strategy={verticalListSortingStrategy}
        id={listId}
      >
        <div
          className={cn(
            "items flex flex-col gap-2",
            layout === "grid" && "grid grid-cols-3 gap-5 xl:grid-cols-6"
          )}
        >
          {sortableItemIds.map((itemId) => (
            <SortableItemCard
              key={itemId}
              itemId={itemId}
              layout={layout === "grid" ? "card" : "inline"}
              selected={selectedItems.includes(itemId)}
              onClick={(e) => onCardClick(e, itemId)}
              onAuxClick={(e) => onCardClick(e, itemId)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function getSortableItemIdsConsideringDragContext(
  listId: string,
  itemsIds: string[],
  dragContext?: ItemDragContext
) {
  if (!dragContext) return itemsIds;

  const { draggedOverListId, mainDraggedId, draggedIds, dragEntry } = dragContext;

  if (draggedOverListId === listId) {
    if (itemsIds.includes(mainDraggedId)) {
      const draggedItemsExceptFocused = draggedIds.filter(
        (itemId) => itemId !== mainDraggedId
      );
      return itemsIds.filter((itemId) => !draggedItemsExceptFocused.includes(itemId));
    } else {
      if (dragEntry === "top") {
        return [mainDraggedId, ...itemsIds];
      } else {
        return itemsIds.concat(mainDraggedId);
      }
    }
  }

  return itemsIds.filter((itemId) => !draggedIds.includes(itemId));
}
