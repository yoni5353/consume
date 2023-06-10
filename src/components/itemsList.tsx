/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import { ItemCard } from "./itemCard";
import { useCallback, useState } from "react";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cn } from "~/utils/ui/cn";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { type DateRange } from "react-day-picker";
import { format, formatDistance } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ListContextMenu } from "./listContextMenu";
import { useToast } from "./ui/use-toast";

export function ItemsList({
  listId,
  onMoveItemsToNewList,
  onCardClick,
  selectedItems,
  layout,
  isSprint,
}: {
  listId: string;
  onCardClick: (e: React.MouseEvent, itemId: string) => void;
  selectedItems: string[];
  onMoveItemsToNewList?: (
    originListId: string,
    itemIds: string[],
    isSprint: boolean
  ) => void;
  layout: "list" | "grid";
  isSprint?: boolean;
}) {
  const [listRef] = useAutoAnimate<HTMLDivElement>();

  const ctx = api.useContext();

  const { toast } = useToast();

  const { data: list, refetch } = api.lists.getList.useQuery(listId, {
    refetchOnWindowFocus: false,
  });

  const { mutate: editList } = api.lists.editList.useMutation({
    onSuccess: () => refetch(),
  });

  const { mutate: deleteItems } = api.items.deleteItems.useMutation({
    async onMutate(itemIds) {
      await ctx.lists.getList.cancel(listId);
      ctx.lists.getList.setData(listId, (prevList) => {
        if (prevList) {
          return {
            ...prevList,
            items: prevList.items.filter((item) => !itemIds.includes(item.itemId)),
          };
        }
      });
    },
    onError: (err) => {
      toast({
        title: "Failed to delete items",
        description: err.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      void ctx.lists.getList.invalidate(listId);
    },
  });

  const { mutate: moveItems } = api.items.moveItems.useMutation({
    onSuccess: (_, { targetListId }) => {
      void ctx.lists.getList.invalidate(listId);
      void ctx.lists.getList.invalidate(targetListId);
    },
  });

  const items = list?.items;

  const [date, setDate] = useState<DateRange>();

  const onSetDate = useCallback(
    (date?: DateRange) => {
      setDate(date);
      editList({ id: listId, startDate: date?.from, dueDate: date?.to ?? null });
    },
    [editList, listId]
  );

  if (!items) return null;

  return (
    <div className="items-list flex flex-col">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="space-y-1 pb-3">
            <h2 className="font-bold uppercase">{list.title}</h2>
            <div className="flex flex-row text-gray-500">
              {isSprint && (
                <Popover>
                  <PopoverTrigger className="flex flex-row text-xs hover:cursor-pointer hover:underline">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    {list.dueDate ? (
                      <div>
                        {format(list.startDate, "LLL dd, y")} -{" "}
                        {format(list.dueDate, "LLL dd, y")}
                        {list.dueDate > new Date() ? (
                          <> ({formatDistance(list.dueDate, new Date())} left)</>
                        ) : (
                          <> ({formatDistance(list.dueDate, new Date())} overdue)</>
                        )}
                      </div>
                    ) : (
                      <div>No due date</div>
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
      <div
        className={cn(
          "items flex flex-col gap-2",
          layout === "grid" && "grid grid-cols-3 gap-5 xl:grid-cols-6"
        )}
        ref={listRef}
      >
        {items?.map((item) => (
          <ItemCard
            key={item.itemId}
            itemId={item.itemId}
            layout={layout === "grid" ? "card" : "inline"}
            selected={selectedItems.includes(item.itemId)}
            onClick={(e) => onCardClick(e, item.itemId)}
            onAuxClick={(e) => onCardClick(e, item.itemId)}
          />
        ))}
      </div>
    </div>
  );
}
