import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ItemsList } from "../itemsList";
import { api } from "~/utils/api";

export function ListStack({
  layout,
  onCreateSprint,
}: {
  layout: "list" | "grid";
  onCreateSprint: () => void;
}) {
  const [sprintsViewRef] = useAutoAnimate<HTMLDivElement>();

  const { data: sprints } = api.lists.getSprints.useQuery();

  return (
    <div className="space-y-3" ref={sprintsViewRef}>
      {sprints?.map((sprint) => (
        <ItemsList
          key={sprint.id}
          layout={layout}
          listId={sprint.id}
          isSprint={true}
          onItemSelected={(id) => {
            /*setSelectedItemId(id)*/
          }}
          onMoveItemsToNewList={(originListId, itemIds, isSprint) => {
            // openListCreation({
            //   originListId,
            //   initialItemsIds: itemIds,
            //   isSprint,
            // });
          }}
        />
      ))}
      <Button variant="ghost" onClick={onCreateSprint}>
        <PlusCircleIcon className="mr-2 h-4 w-4" />
        Create Sprint
      </Button>
    </div>
  );
}
