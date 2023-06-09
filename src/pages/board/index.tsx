import { ArrowBigRight, PlusCircleIcon } from "lucide-react";
import { type NextPage } from "next";
import { useCallback, useState } from "react";
import { ItemsList } from "~/components/itemsList";
import { CreateListDialog } from "~/components/createListDialog";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { type CreateListSechemaType } from "~/utils/apischemas";
import { cn } from "~/utils/ui/cn";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Toggle } from "~/components/ui/toggle";
import { ItemCreationInput } from "~/components/itemCreationInput";
import { CreateGoalDialog } from "~/components/createGoalDialog";
import { NavBar } from "~/components/views/navbar";
import { TopBar } from "~/components/views/topbar";
import Head from "next/head";

const DEFAULT_COLORS: [string, string] = ["#3b82f6", "#76b9ce"];

const BoardPage: NextPage = () => {
  const [gradientColors, setGradientColors] = useState<[string, string]>(DEFAULT_COLORS);
  const [currentLayout, setCurrentLayout] = useState<"list" | "grid">("list");
  const [currentLists, setCurrentLists] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [sprintsViewRef] = useAutoAnimate<HTMLDivElement>();
  const [currentCreationList, setCurrentCreationList] = useState<string>();
  const [isCreatingGoal, setIsCreatingGoal] = useState<boolean>();

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

  const { mutate: createList } = api.lists.createList.useMutation({
    onSuccess: (newList) => {
      if (newList.isSprint) {
        selectSprint(newList.id);
        void ctx.lists.getSprints.invalidate();
      } else {
        moveToList(newList.id);
        void ctx.lists.getBacklog.invalidate();
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
      <Head>
        <title>CONSUME</title>
        <meta name="description" content="Consume Board" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main
        className="flex min-h-screen flex-row"
        style={{
          backgroundImage: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`,
        }}
      >
        <div className="m-3 flex w-full flex-col overflow-hidden rounded-md bg-background">
          <TopBar
            onLayoutChange={setCurrentLayout}
            gradientColorsState={[gradientColors, setGradientColors]}
          />

          <div className="main-grid grid h-full w-full grid-cols-5 px-5 xl:grid-cols-6">
            <div className="flex flex-col justify-center">
              <div className="flex flex-row items-center">
                {isNavbarOpen && <NavBar />}
                <Toggle onPressedChange={(pressed) => setIsNavbarOpen(pressed)}>
                  <ArrowBigRight className="h-4 w-4" />
                </Toggle>
              </div>
            </div>

            <div className="col-span-3 overflow-hidden xl:col-span-4">
              <div className="lists items-top container grid h-full w-full grid-cols-1 justify-center overflow-auto p-4">
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
                      onMoveItemsToNewList={(originListId, itemIds, isSprint) => {
                        openListCreation({
                          originListId,
                          initialItemsIds: itemIds,
                          isSprint,
                        });
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
                          onMoveItemsToNewList={(originListId, itemIds, isSprint) => {
                            openListCreation({
                              originListId,
                              initialItemsIds: itemIds,
                              isSprint,
                            });
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
