/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import { ItemCard } from "./itemCard";
import { LayoutTemplateIcon, PlusCircleIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { ItemContextMenu } from "./itemContextMenu";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandSeparator,
} from "./ui/command";
import { CommandLoading } from "cmdk";
import { cn } from "~/utils/ui/cn";

export function ItemsList({
  listId,
  onItemSelected,
  onMoveItemsToNewList,
}: {
  listId: string;
  onItemSelected: (itemId: string) => void;
  onMoveItemsToNewList?: (originListId: string, itemIds: string[]) => void;
}) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lastSelectedItem, setLastSelectedItem] = useState<string>();
  const [listRef] = useAutoAnimate<HTMLDivElement>();

  const { data: listWithItems, refetch } = api.lists.getWithItems.useQuery(listId, {
    onSuccess: () => {
      if (listWithItems?.items[0] && !lastSelectedItem) {
        setLastSelectedItem(listWithItems.items[0].itemId);
      }
    },
  });

  const { mutate: deleteItems } = api.items.deleteItems.useMutation({
    onSuccess: () => refetch(),
  });

  const { mutate: moveItems } = api.items.moveItems.useMutation({
    onSuccess: () => refetch(),
  });

  const items = listWithItems?.items;

  if (!items) return null;

  const onCardClick = (e: React.MouseEvent, itemId: string, auxClick = false) => {
    onItemSelected(itemId);

    // Selection logic
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

  return (
    <div className="items-list relative flex flex-col gap-3">
      <div className="item-creation-field absolute z-10 w-full">
        <ItemCreation listId={listId} />
      </div>
      <div className="h-12" />
      <ContextMenu modal={false}>
        <ContextMenuTrigger>
          <div className="items flex flex-col gap-2" ref={listRef}>
            {items?.map((item) => (
              <ItemCard
                item={item.item}
                key={item.itemId}
                selected={selectedItems.includes(item.itemId)}
                onClick={(e) => onCardClick(e, item.itemId)}
                onAuxClick={(e) => onCardClick(e, item.itemId, true)}
              />
            ))}
          </div>
        </ContextMenuTrigger>
        <ItemContextMenu
          listId={listId}
          itemsAmount={selectedItems.length}
          onDelete={() => {
            deleteItems(selectedItems);
          }}
          onMoveItems={(targetListId) => {
            moveItems({ itemIds: selectedItems, targetListId });
          }}
          onMoveItemsToNewList={(originListId) =>
            onMoveItemsToNewList?.(
              originListId,
              selectedItems.map((itemId) => itemId)
            )
          }
        />
      </ContextMenu>
    </div>
  );
}

function ItemCreation({ listId }: { listId: string }) {
  const [term, setTerm] = useState<string>("");

  const ctx = api.useContext();

  const { data: templates, isLoading } = api.templates.searchItemTemplates.useQuery(
    term,
    { keepPreviousData: true }
  );

  const { mutate: createItem } = api.items.createItem.useMutation({
    onSuccess: () => {
      setTerm("");
      void ctx.lists.getWithItems.invalidate(listId);
    },
  });

  const { mutate: createItemFromTemplate } = api.items.createItemFromTemplate.useMutation(
    {
      onSuccess: () => {
        setTerm("");
        void ctx.lists.getWithItems.invalidate(listId);
      },
    }
  );

  const onCreateNew = useCallback(() => {
    createItem({ listId, item: { title: term } });
  }, [createItem, listId, term]);

  const onCreateFromTemplate = useCallback(
    (templateId: string) => {
      createItemFromTemplate({ listId, templateId });
    },
    [createItemFromTemplate, listId]
  );

  return (
    <Command className="h-min w-full border-2 dark:border-slate-950" shouldFilter={false}>
      <CommandInput
        placeholder="Enter a new Thingy"
        value={term}
        onValueChange={setTerm}
      />
      {!!term && (
        <CommandList>
          <CommandGroup
            title="Create New"
            className={cn(!!term && !!templates?.length ? "pb-0" : "")}
          >
            <CommandItem onSelect={onCreateNew}>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create Item&nbsp;{term ? <i>{`'${term}'`}</i> : ""}
            </CommandItem>
          </CommandGroup>
          {!!term && !!templates?.length && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Templates">
                {isLoading && <CommandLoading>Loading...</CommandLoading>}
                {templates?.map((template) => {
                  return (
                    <CommandItem
                      key={template.id}
                      onSelect={() => onCreateFromTemplate(template.id)}
                    >
                      <LayoutTemplateIcon className="mr-2 h-4 w-4" />
                      {template.title}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}
        </CommandList>
      )}
    </Command>
  );
}
