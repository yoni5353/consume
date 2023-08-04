import { Toggle } from "../ui/toggle";
import { ArrowBigRight } from "lucide-react";
import { ItemCreationInput } from "../itemCreationInput";
import { ListStack } from "./listStack";
import { NavBar } from "./navbar";
import { useCallback, useState } from "react";
import { type CreateListSechemaType } from "~/utils/apischemas";
import { CreateListDialog } from "../createListDialog";
import { api } from "~/utils/api";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ItemCard } from "../itemCard";

export function ListPageContent({ layout }: { layout: "list" | "grid" }) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [itemCreationList, setItemCreationList] = useState<string>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lastSelectedItem, setLastSelectedItem] = useState<string>();

  const ctx = api.useContext();

  const { data: sprints } = api.lists.getSprints.useQuery(undefined, {
    onSuccess: (newSprints) => {
      if (!itemCreationList && newSprints.length) {
        setItemCreationList(newSprints[0]?.id);
      }
    },
  });

  const items = sprints?.flatMap((sprint) => sprint.items) ?? [];

  // SELECTION

  const selectCardPreDrag = useCallback(
    (itemId: string) => {
      if (!selectedItems.includes(itemId)) {
        setSelectedItems([itemId]);
        setLastSelectedItem(itemId);
      }
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
        const index = items.findIndex((item) => item.itemId === itemId);
        const firstIndex = items.findIndex((item) => item.itemId === lastSelectedItem);
        if (~index && ~firstIndex) {
          const start = Math.min(index, firstIndex);
          const end = Math.max(index, firstIndex);
          const newSelectedItems = items.slice(start, end + 1).map((item) => item.itemId);
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
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const { id: itemId } = event.active;
      if (typeof itemId !== "string") return;

      console.log("drag start", itemId);
      selectCardPreDrag(itemId);
    },
    [selectCardPreDrag]
  );

  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
    }
  }, []);

  if (!lastSelectedItem && items[0]) {
    setLastSelectedItem(items[0].itemId);
  }

  // LIST CREATION

  const { mutate: createList } = api.lists.createList.useMutation({
    onSuccess: (newList) => {
      if (newList.isSprint) {
        void ctx.lists.getSprints.invalidate();
      } else {
        void ctx.lists.getBacklog.invalidate();
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

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="main-grid grid h-full w-full grid-cols-8 px-5 xl:grid-cols-6">
          {/* NAVBAR */}
          <div className="flex flex-col justify-center">
            <div className="flex flex-row items-center">
              {isNavbarOpen && <NavBar />}
              <Toggle onPressedChange={(pressed) => setIsNavbarOpen(pressed)}>
                <ArrowBigRight className="h-4 w-4" />
              </Toggle>
            </div>
          </div>

          {/* THE LIST */}
          <div className="col-span-6 overflow-hidden xl:col-span-4">
            <div className="lists items-top container grid h-full w-full grid-cols-1 justify-center overflow-auto p-4">
              <div className="relative flex h-full w-full flex-col space-y-5 overflow-y-auto overflow-x-hidden px-10 pt-2">
                {/* CREATION COMMAND */}
                <div className="item-creation-field absolute z-10 w-full pr-20">
                  {itemCreationList && <ItemCreationInput listId={itemCreationList} />}
                </div>
                <div className="h-6" />
                {/* LIST STACK */}
                <ListStack
                  layout={layout}
                  onCreateSprint={() => openListCreation({ isSprint: true })}
                  selectedItems={selectedItems}
                  onCardClick={onCardClick}
                />
              </div>
            </div>
          </div>
        </div>
        <DragOverlay>
          {selectedItems[0] ? (
            <ItemCard itemId={selectedItems[0]} selected={true} layout="inline" />
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