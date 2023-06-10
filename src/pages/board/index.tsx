import { ArrowBigRight } from "lucide-react";
import { type NextPage } from "next";
import { useCallback, useState } from "react";
import { CreateListDialog } from "~/components/createListDialog";
import { api } from "~/utils/api";
import { type CreateListSechemaType } from "~/utils/apischemas";
import { Toggle } from "~/components/ui/toggle";
import { ItemCreationInput } from "~/components/itemCreationInput";
import { CreateGoalDialog } from "~/components/createGoalDialog";
import { NavBar } from "~/components/views/navbar";
import { TopBar } from "~/components/views/topbar";
import Head from "next/head";
import { ListStack } from "~/components/views/listStack";

const DEFAULT_COLORS: [string, string] = ["#3b82f6", "#76b9ce"];

const BoardPage: NextPage = () => {
  const [gradientColors, setGradientColors] = useState<[string, string]>(DEFAULT_COLORS);
  const [currentLayout, setCurrentLayout] = useState<"list" | "grid">("list");
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [itemCreationList, setItemCreationList] = useState<string>();
  const [isCreatingGoal, setIsCreatingGoal] = useState<boolean>();

  const ctx = api.useContext();

  const { data: sprints } = api.lists.getSprints.useQuery(undefined, {
    onSuccess: (newSprints) => {
      if (!itemCreationList && newSprints.length) {
        setItemCreationList(newSprints[0]?.id);
      }
    },
  });

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
          {/* TOPBAR */}
          <TopBar
            onLayoutChange={setCurrentLayout}
            gradientColorsState={[gradientColors, setGradientColors]}
          />

          <div className="main-grid grid h-full w-full grid-cols-5 px-5 xl:grid-cols-6">
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
            <div className="col-span-3 overflow-hidden xl:col-span-4">
              <div className="lists items-top container grid h-full w-full grid-cols-1 justify-center overflow-auto p-4">
                <div className="relative flex h-full w-full flex-col space-y-5 overflow-y-auto overflow-x-hidden px-10 pt-2">
                  {/* CREATION COMMAND */}
                  <div className="item-creation-field absolute z-10 w-full pr-20">
                    {itemCreationList && <ItemCreationInput listId={itemCreationList} />}
                  </div>
                  <div className="h-6" />
                  {/* LIST STACK */}
                  <ListStack
                    layout={currentLayout}
                    onCreateSprint={() => openListCreation({ isSprint: true })}
                  />
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
