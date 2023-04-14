/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import { ItemCard } from "./itemCard";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm, type SubmitHandler } from "react-hook-form";
import { LayoutTemplateIcon, Plus, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { ItemContextMenu } from "./itemContextMenu";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandSeparator,
} from "./ui/command";
import { CommandLoading } from "cmdk";

export function ItemsList({
  listId,
  onItemSelected,
  onMoveItemsToNewList,
}: {
  listId: string;
  onItemSelected: (itemId: string) => void;
  onMoveItemsToNewList?: (originListId: string, itemIds: string[]) => void;
}) {
  const { register, handleSubmit, reset } = useForm<{ itemTitle: string }>();
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

  const { mutate: addItem } = api.lists.createItemInList.useMutation({
    onSuccess: () => refetch(),
  });

  const onCreateItem: SubmitHandler<{ itemTitle: string }> = (data) => {
    addItem({
      listId,
      item: { title: data.itemTitle },
    });
    reset();
  };

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
    <div className="items-list flex flex-col gap-3">
      <ItemCreation />
      <form onSubmit={handleSubmit(onCreateItem)} className="flex flex-row gap-2">
        <Input {...register("itemTitle", { required: true, maxLength: 256 })} />
        <Button type="submit" variant="subtle" className="p-2">
          <Plus />
        </Button>
      </form>
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

function ItemCreation() {
  const [search, setSearch] = useState<string>("");

  const { data: templates, isLoading } = api.templates.searchItemTemplates.useQuery(
    search,
    { keepPreviousData: true }
  );

  return (
    <Command className="z-10 h-min w-full" shouldFilter={false}>
      <CommandInput placeholder="Enter a new Thingy" onValueChange={setSearch} />
      <CommandList>
        <CommandGroup title="Create New">
          <CommandItem onSelect={(e) => console.log(e)}>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Create Item&nbsp;{search ? <i>{`'${search}'`}</i> : ""}
          </CommandItem>
        </CommandGroup>
        {!!search && !!templates?.length && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Templates">
              {isLoading && <CommandLoading>Loading...</CommandLoading>}
              {templates?.map((template) => {
                return (
                  <CommandItem key={template.id} onSelect={(e) => console.log(e)}>
                    <LayoutTemplateIcon className="mr-2 h-4 w-4" />
                    {template.title}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}
