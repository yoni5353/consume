import { ListIcon, PlusCircleIcon, Trash2 } from "lucide-react";
import { type NextPage } from "next";
import { useCallback, useState } from "react";
import { ItemDisplay } from "~/components/itemDisplay";
import { ItemsList } from "~/components/itemsList";
import { CreateListDialog } from "~/components/createListDialog";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuContent,
} from "~/components/ui/context-menu";
import { type CreateListSechemaType } from "~/utils/apischemas";

const BoardPage: NextPage = () => {
  const [currentLists, setCurrentLists] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

  const { data: lists, refetch } = api.lists.getUserLists.useQuery();

  const { mutate: createList } = api.lists.createList.useMutation({
    onSuccess: (newList) => {
      closeListCreation();
      void refetch();
      setCurrentLists([newList.id]);
    },
  });

  const { mutate: deleteList } = api.lists.deleteList.useMutation({
    onSuccess: () => {
      closeListCreation();
      void refetch();
    },
  });

  const [_isCreateListOpen, _setIsCreateListOpen] = useState(false);
  const [hasInitialItems, _setHasInitialItems] = useState(false);
  const [nextListCreation, _setNextListCreation] = useState<
    Partial<CreateListSechemaType>
  >({});
  const openListCreation = useCallback(
    (creationPartial: Partial<CreateListSechemaType> = {}) => {
      _setNextListCreation(creationPartial);
      _setHasInitialItems(!!creationPartial.initialItemsIds?.length);
      _setIsCreateListOpen(true);
    },
    []
  );
  const closeListCreation = () => _setIsCreateListOpen(false);

  if (lists && currentLists.length === 0) {
    if (lists[0]) {
      setCurrentLists([lists[0].id]);
    }
  }

  return (
    <>
      <main className="flex min-h-screen flex-row bg-gradient-to-b from-rose-500 to-indigo-700">
        <div className="main-grid mx-3 mt-3 grid h-[97vh] w-full grid-cols-4 overflow-hidden rounded-md bg-slate-900 p-5 xl:grid-cols-5 ">
          <aside className="sidebar space-y-5 pr-10">
            <h1 className="align-center mb-2 flex flex-row px-2 text-2xl font-extrabold tracking-tight">
              CONSUME
            </h1>
            <div className="overflow-auto">
              <h2 className="align-center mb-2 flex flex-row px-2 text-lg font-semibold tracking-tight">
                Lists
              </h2>
              <div className="space-y-2">
                <ContextMenu modal={false}>
                  <ContextMenuTrigger>
                    <div className="space-y-2">
                      {lists?.map((list) => (
                        <Button
                          key={list.id}
                          variant={currentLists.includes(list.id) ? "subtle" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-xs font-extrabold"
                          onClick={() => setCurrentLists([list.id])}
                          onAuxClick={() => setCurrentLists([list.id])}
                        >
                          <ListIcon className="mr-2 h-4 w-4" />
                          <span className="uppercase">{list.title}</span>
                        </Button>
                      ))}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onSelect={() => {
                        const lastList = currentLists.at(-1);
                        lastList && deleteList(lastList);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete List
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => openListCreation()}
                >
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  New List
                </Button>
              </div>
            </div>
          </aside>
          <div className="col-span-3 overflow-hidden border-l border-slate-500 xl:col-span-4">
            <div className="lists items-top container grid h-full w-full grid-cols-1 grid-rows-2 justify-center overflow-auto px-4 py-16">
              <div className="flex h-full flex-col overflow-auto px-20">
                {currentLists[0] && (
                  <ItemsList
                    listId={currentLists[0]}
                    onItemSelected={(id) => setSelectedItemId(id)}
                    onMoveItemsToNewList={(originListId, itemIds) => {
                      openListCreation({ originListId, initialItemsIds: itemIds });
                    }}
                  />
                )}
              </div>
              <div className="item-display px-10">
                {selectedItemId && <ItemDisplay itemId={selectedItemId} />}
              </div>
            </div>
          </div>
        </div>
      </main>
      <CreateListDialog
        open={_isCreateListOpen}
        onOpenChange={closeListCreation}
        onCreateList={(data) => createList({ ...data, ...nextListCreation })}
        hasInitialItems={hasInitialItems}
      />
    </>
  );
};

export default BoardPage;
