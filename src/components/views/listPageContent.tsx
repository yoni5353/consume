import { Toggle } from "../ui/toggle";
import { ArrowBigRight } from "lucide-react";
import { ItemCreationInput } from "../itemCreationInput";
import { ListStack } from "./listStack";
import { NavBar } from "./navbar";
import { useCallback, useEffect, useState } from "react";
import { type CreateListSechemaType } from "~/utils/apischemas";
import { CreateListDialog } from "../createListDialog";
import { api } from "~/utils/api";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragOverEvent,
} from "@dnd-kit/core";
import { ItemCard } from "../itemCard";
import { useItemsInLists } from "~/utils/queries/useItemsInLists";
import { type ItemsInLists } from "@prisma/client";
import { getOverListId, getOverIndex } from "~/utils/dnd/itemDndUtils";

export type ItemDragContext = {
  draggedIds: string[];
  mainDraggedId: string;
  draggedOverListId: string;
  dragEntry?: "top" | "bottom";
};

export function ListPageContent({ layout }: { layout: "list" | "grid" }) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [itemCreationList, setItemCreationList] = useState<string>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lastSelectedItem, setLastSelectedItem] = useState<string>();
  const [dragContext, setDragContext] = useState<ItemDragContext>();

  const ctx = api.useContext();

  const { data: lists } = api.lists.getLists.useQuery();

  const { mutate: moveItems } = api.lists.moveItems.useMutation();

  const itemsInLists = useItemsInLists(lists?.map((list) => list.id) ?? []);

  api.lists.getSprints.useQuery(undefined, {
    onSuccess: (newSprints) => {
      if (!itemCreationList && newSprints.length) {
        setItemCreationList(newSprints[0]?.id);
      }
    },
  });

  // SELECTION

  const selectCardPreDrag = useCallback(
    (itemId: string) => {
      if (!selectedItems.includes(itemId)) {
        setSelectedItems([itemId]);
      }
      setLastSelectedItem(itemId);
    },
    [selectedItems]
  );

  const onCardClick = (e: React.MouseEvent, itemId: string) => {
    const auxClick = e.button === 1 || e.button === 2;

    const newSelectedItem = itemId;
    if (e.ctrlKey) {
      setSelectedItems((prev) => {
        if (prev.includes(itemId)) {
          return prev.filter((id) => id !== itemId);
        } else {
          return [...prev, itemId];
        }
      });
    } else if (e.shiftKey) {
      if (lastSelectedItem) {
        const index = itemsInLists.findIndex((item) => item.itemId === itemId);
        const firstIndex = itemsInLists.findIndex(
          (item) => item.itemId === lastSelectedItem
        );
        if (~index && ~firstIndex) {
          const start = Math.min(index, firstIndex);
          const end = Math.max(index, firstIndex);
          const newSelectedItems = itemsInLists
            .slice(start, end + 1)
            .map((item) => item.itemId);
          setSelectedItems((prev) => {
            return [...new Set([...prev, ...newSelectedItems])];
          });
        }
      }
    } else {
      if (!(auxClick && selectedItems.includes(itemId))) {
        setSelectedItems([itemId]);
      }
    }
    if (!e.shiftKey) {
      setLastSelectedItem(newSelectedItem);
    }
  };

  // DRAG AND DROP

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const onDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      const { id: itemId } = active;
      if (typeof itemId !== "string") return;

      selectCardPreDrag(itemId);

      setDragContext({
        draggedIds: selectedItems,
        mainDraggedId: active.id as string,
        draggedOverListId: getOverListId(active),
      });
    },
    [selectCardPreDrag, selectedItems]
  );

  const onDragOver = useCallback(
    ({ active: _, over }: DragOverEvent) => {
      const overListId = getOverListId(over);
      const overIndex = getOverIndex(over);

      if (overListId !== dragContext?.draggedOverListId) {
        setDragContext((prev) => {
          if (prev) {
            return {
              ...prev,
              draggedOverListId: overListId,
              dragEntry: overIndex === 0 ? "top" : "bottom",
            };
          }
        });
      }
    },
    [dragContext?.draggedOverListId]
  );

  const onDragEnd = useCallback(
    ({ over }: DragEndEvent) => {
      if (!dragContext) return;

      const overIndex = getOverIndex(over);

      const { draggedIds, draggedOverListId } = dragContext;
      const draggedItemsInLists = draggedIds
        .map((itemId) => itemsInLists.find((item) => item.itemId === itemId))
        .filter((item): item is ItemsInLists => !!item);
      const relatedLists = [
        ...new Set<string>([
          ...draggedItemsInLists.map((item) => item.listId),
          draggedOverListId,
        ]),
      ];

      // Optimistcly update items
      relatedLists.map((listId) => {
        ctx.lists.getList.setData(listId, (prevList) => {
          if (!prevList) return;
          prevList.items = prevList.items.filter(
            (item) => !draggedIds.includes(item.itemId)
          );
          return prevList;
        });
      });

      const itemsToAdd = draggedItemsInLists.map((item) => ({
        ...item,
        listId: draggedOverListId,
      }));

      ctx.lists.getList.setData(draggedOverListId, (prevList) => {
        if (!prevList) return;
        prevList.items.splice(overIndex, 0, ...itemsToAdd);
        return prevList;
      });

      // Actually move items
      moveItems({
        targetListId: draggedOverListId,
        prevConnections: draggedItemsInLists,
        insertAt: overIndex,
      });

      setDragContext(undefined);
    },
    [ctx.lists.getList, dragContext, itemsInLists, moveItems]
  );

  if (!lastSelectedItem && itemsInLists[0]) {
    setLastSelectedItem(itemsInLists[0].itemId);
  }

  // LIST CREATION

  const { mutate: createList } = api.lists.createList.useMutation({
    onSuccess: (newList) => {
      if (newList.isSprint) {
        void ctx.lists.getSprints.invalidate();
      }
    },
  });

  const [_isCreateListOpen, _setIsCreateListOpen] = useState(false);
  const [hasInitialItems, _setHasInitialItems] = useState(false);
  const [isCreatingSprint, _setIsCreatingSprint] = useState(false);
  const [nextListCreation, _setNextListCreation] = useState<
    Partial<CreateListSechemaType>
  >({});
  const openListCreation = useCallback(
    (creationPartial: Partial<CreateListSechemaType> = {}) => {
      _setNextListCreation(creationPartial);
      _setHasInitialItems(!!creationPartial.initialItemsIds?.length);
      _setIsCreatingSprint(!!creationPartial.isSprint);
      _setIsCreateListOpen(true);
    },
    []
  );
  const closeListCreation = useCallback(() => _setIsCreateListOpen(false), []);

  // MISC

  const flyToList = useCallback((listId: string) => {
    const listElement = document.getElementById(`list-${listId}`);
    if (listElement) {
      listElement.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="main-grid grid h-full w-full grid-cols-1 md:grid-cols-6 md:px-5">
          {/* NAVBAR */}
          <div className="hidden flex-col justify-center md:flex">
            <div className="flex flex-row items-center">
              {isNavbarOpen && <NavBar onClickList={flyToList} />}
              <Toggle onPressedChange={(pressed) => setIsNavbarOpen(pressed)}>
                <ArrowBigRight className="h-4 w-4" />
              </Toggle>
            </div>
          </div>

          {/* THE LIST */}
          <div className="col-span-4 block overflow-hidden">
            <div className="lists items-top container grid h-full w-full grid-cols-1 justify-center overflow-hidden px-4 pb-2">
              <div className="relative flex h-full w-full flex-col overflow-hidden px-2 pt-2 md:px-10">
                {/* CREATION COMMAND */}
                <div className="item-creation-field z-10 w-full">
                  {itemCreationList && <ItemCreationInput listId={itemCreationList} />}
                </div>
                <div className="h-4" />
                {/* LIST STACK */}
                <div className="relative flex flex-col gap-5 overflow-auto">
                  <ListStack
                    layout={layout}
                    onCreateSprint={() => openListCreation({ isSprint: true })}
                    selectedItems={selectedItems}
                    onCardClick={onCardClick}
                    dragContext={dragContext}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DragOverlay>
          {lastSelectedItem ? (
            <ItemCard itemId={lastSelectedItem} selected={true} layout="inline" />
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateListDialog
        open={_isCreateListOpen}
        onOpenChange={closeListCreation}
        onCreateList={(data) => createList({ ...data, ...nextListCreation })}
        hasInitialItems={hasInitialItems}
        isCreatingSprint={isCreatingSprint}
      />
    </>
  );
}
