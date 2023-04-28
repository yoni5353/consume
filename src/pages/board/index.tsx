import { BikeIcon, Layout, ListIcon, PlusCircleIcon, Trash2 } from "lucide-react";
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
import { cn } from "~/utils/ui/cn";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Toggle } from "~/components/ui/toggle";
import { ItemCreationInput } from "~/components/itemCreationInput";
import { ListContextMenu } from "~/components/listContextMenu";
import { CreateGoalDialog } from "~/components/createGoalDialog";
import { MediaTypeIcon } from "~/components/resources/mediaTypeIcon";

const BoardPage: NextPage = () => {
  const [currentLayout, setCurrentLayout] = useState<"list" | "grid">("list");
  const [currentLists, setCurrentLists] = useState<string[]>([]);
  const [currentContextMenuSprint, setCurrentContextMenuSprint] = useState<string>();
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [sprintsRef] = useAutoAnimate<HTMLDivElement>();
  const [backlogRef] = useAutoAnimate<HTMLDivElement>();
  const [sprintsViewRef] = useAutoAnimate<HTMLDivElement>();
  const [currentCreationList, setCurrentCreationList] = useState<string>();
  const [isCreatingGoal, setIsCreatingGoal] = useState<boolean>();
  const [selectedGoal, setSelectedGoal] = useState<string>();

  const ctx = api.useContext();

  const { data: lists, refetch } = api.lists.getBacklog.useQuery();

  const { data: sprints, refetch: refetchSprints } = api.lists.getSprints.useQuery(
    undefined,
    {
      onSuccess: (newSprints) => {
        if (!currentCreationList && newSprints.length) {
          setCurrentCreationList(newSprints[0]?.id);
        }
      },
    }
  );

  const { data: goals } = api.goals.getGoals.useQuery();

  const { mutate: deleteGoal } = api.goals.delete.useMutation({
    onSuccess: () => {
      void ctx.goals.getGoals.invalidate();
    },
  });

  const { mutate: createList } = api.lists.createList.useMutation({
    onSuccess: (newList) => {
      closeListCreation();
      void refetch();
      void refetchSprints();

      if (newList.isSprint) {
        selectSprint(newList.id);
      } else {
        moveToList(newList.id);
      }
    },
  });

  const moveToList = useCallback((listId: string | undefined) => {
    setCurrentLists(listId ? [listId] : []);
    setSelectedItemId(undefined);
    setCurrentCreationList(listId);
  }, []);

  const selectSprint = useCallback(
    (sprintId: string) => {
      setCurrentLists([]);
      setSelectedItemId(undefined);
      setCurrentCreationList(sprints?.[0]?.id);
    },
    [sprints]
  );

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
      <main className="flex min-h-screen flex-row bg-gradient-to-b from-rose-500 to-indigo-700">
        <div className="main-grid m-3 grid w-full grid-cols-4 overflow-hidden rounded-md bg-background p-5 xl:grid-cols-5 ">
          <aside className="sidebar space-y-5 pr-10">
            <h1 className="align-center mb-2 flex flex-row px-2 text-2xl font-extrabold tracking-tight">
              CONSUME
            </h1>
            <div className="space-y-12 overflow-auto px-2">
              <div>
                <h2 className="align-center mb-2 flex flex-row px-2 text-lg font-semibold tracking-tight">
                  Sprints
                </h2>
                <div className="space-y-2 pb-1">
                  <ContextMenu modal={false}>
                    <ContextMenuTrigger>
                      <div className="sprints-list space-y-2" ref={sprintsRef}>
                        {sprints?.map((sprint) => (
                          <Button
                            key={sprint.id}
                            variant={
                              currentLists.includes(sprint.id) ? "secondary" : "ghost"
                            }
                            size="sm"
                            className="w-full justify-start text-xs font-extrabold"
                            onClick={() => {
                              selectSprint(sprint.id);
                              setCurrentContextMenuSprint(sprint.id);
                            }}
                            onAuxClick={() => {
                              selectSprint(sprint.id); // do not fly to sprint here
                              setCurrentContextMenuSprint(sprint.id);
                            }}
                          >
                            <BikeIcon className="mr-2 h-4 w-4" />
                            <span className="uppercase">{sprint.title}</span>
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => openListCreation({ isSprint: true })}
                        >
                          <PlusCircleIcon className="mr-2 h-4 w-4" />
                          New Sprint
                        </Button>
                      </div>
                    </ContextMenuTrigger>
                    <ListContextMenu
                      selectedListId={currentContextMenuSprint ?? null}
                      isSprint
                    />
                  </ContextMenu>
                </div>
              </div>
              <div>
                <h2 className="align-center mb-2 flex flex-row px-2 text-lg font-semibold tracking-tight">
                  Backlog
                </h2>
                <div className="space-y-2 pb-1">
                  <ContextMenu modal={false}>
                    <ContextMenuTrigger>
                      <div className="lists-list space-y-2" ref={backlogRef}>
                        {lists?.map((list) => (
                          <Button
                            key={list.id}
                            variant={
                              currentLists.includes(list.id) ? "secondary" : "ghost"
                            }
                            size="sm"
                            className="w-full justify-start text-xs font-extrabold"
                            onClick={() => moveToList(list.id)}
                            onAuxClick={() => moveToList(list.id)}
                          >
                            <ListIcon className="mr-2 h-4 w-4" />
                            <span className="uppercase">{list.title}</span>
                          </Button>
                        ))}
                      </div>
                    </ContextMenuTrigger>
                    <ListContextMenu
                      selectedListId={currentLists[0] ?? null}
                      onDelete={() => {
                        moveToList(lists?.[0]?.id);
                      }}
                    />
                  </ContextMenu>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => openListCreation()}
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                    Create List
                  </Button>
                </div>
              </div>
              <div>
                <h2 className="mb-2 flex flex-row items-center px-2 text-lg font-semibold tracking-tight">
                  Goals
                </h2>
                <div className="space-y-2 pb-1">
                  <ContextMenu modal={false}>
                    <ContextMenuTrigger>
                      <div className="lists-list space-y-2" ref={backlogRef}>
                        {goals?.map((goal) => (
                          <Button
                            key={goal.id}
                            variant="ghost"
                            size="sm"
                            className="flex w-full flex-row justify-start space-x-2 text-xs font-extrabold"
                            onClick={() => setSelectedGoal(goal.id)}
                            onAuxClick={() => setSelectedGoal(goal.id)}
                          >
                            <span className="uppercase">1/{goal.targetValue}</span>
                            <div className="flex items-center space-x-2 rounded-lg bg-secondary/70 p-1">
                              <MediaTypeIcon
                                mediaType={goal.targetMediaType ?? undefined}
                                className="mr-2"
                              />
                              {goal.targetMediaType?.name ?? "Item"}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onSelect={() => {
                          selectedGoal && deleteGoal(selectedGoal);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Goal
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsCreatingGoal(true)}
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                    Set Goal
                  </Button>
                </div>
              </div>
            </div>
          </aside>
          <div className="col-span-3 overflow-hidden border-l border-slate-500 xl:col-span-4">
            <div className="flex w-full flex-row-reverse">
              <Toggle
                onPressedChange={(pressed) => setCurrentLayout(pressed ? "grid" : "list")}
              >
                <Layout className="h-4 w-4" />
              </Toggle>
            </div>
            <div className="lists items-top container grid h-full w-full grid-cols-1 grid-rows-3 justify-center overflow-auto p-4">
              <div
                className={cn(
                  "relative flex h-full w-full flex-col space-y-5 overflow-y-auto overflow-x-hidden px-10 pt-2",
                  !!selectedItemId ? "row-span-2" : "row-span-3"
                )}
              >
                <div className="item-creation-field absolute z-10 w-full pr-20">
                  {currentCreationList && (
                    <ItemCreationInput listId={currentCreationList} />
                  )}
                </div>
                <div className="h-8"></div>
                {currentLists[0] && (
                  <ItemsList
                    layout={currentLayout}
                    listId={currentLists[0]}
                    onItemSelected={(id) => setSelectedItemId(id)}
                    onMoveItemsToNewList={(originListId, itemIds) => {
                      openListCreation({ originListId, initialItemsIds: itemIds });
                    }}
                  />
                )}
                {!currentLists[0] && (
                  <div className="space-y-3" ref={sprintsViewRef}>
                    {sprints?.map((sprint) => (
                      <ItemsList
                        key={sprint.id}
                        layout={currentLayout}
                        listId={sprint.id}
                        isSprint={true}
                        onItemSelected={(id) => setSelectedItemId(id)}
                        onMoveItemsToNewList={(originListId, itemIds) => {
                          openListCreation({ originListId, initialItemsIds: itemIds });
                        }}
                      />
                    ))}
                    <Button
                      variant="ghost"
                      onClick={() => openListCreation({ isSprint: true })}
                    >
                      <PlusCircleIcon className="mr-2 h-4 w-4" />
                      Create Sprint
                    </Button>
                  </div>
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
        isCreatingSprint={isCreatingSprint}
      />
      <CreateGoalDialog
        open={isCreatingGoal}
        onOpenChange={() => setIsCreatingGoal(false)}
      />
    </>
  );
};

export default BoardPage;
