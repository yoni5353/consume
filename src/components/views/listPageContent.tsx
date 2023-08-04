import { Toggle } from "../ui/toggle";
import { ArrowBigRight } from "lucide-react";
import { ItemCreationInput } from "../itemCreationInput";
import { ListStack } from "./listStack";
import { NavBar } from "./navbar";
import { useCallback, useState } from "react";
import { type CreateListSechemaType } from "~/utils/apischemas";
import { CreateListDialog } from "../createListDialog";
import { api } from "~/utils/api";

export function ListPageContent({ layout }: { layout: "list" | "grid" }) {
  const [_isCreateListOpen, _setIsCreateListOpen] = useState(false);
  const [hasInitialItems, _setHasInitialItems] = useState(false);
  const [isCreatingSprint, _setIsCreatingSprint] = useState(false);
  const [nextListCreation, _setNextListCreation] = useState<
    Partial<CreateListSechemaType>
  >({});

  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [itemCreationList, setItemCreationList] = useState<string>();

  const ctx = api.useContext();

  api.lists.getSprints.useQuery(undefined, {
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
              />
            </div>
          </div>
        </div>
      </div>
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
