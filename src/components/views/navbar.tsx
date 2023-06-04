import { BikeIcon, ListIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ListContextMenu } from "~/components/listContextMenu";

export function NavBar() {
  const [currentContextMenuSprint, setCurrentContextMenuSprint] = useState<string>();
  const [currentContextMenuList, setCurrentContextMenuList] = useState<string>();
  const [sprintsRef] = useAutoAnimate<HTMLDivElement>();
  const [backlogRef] = useAutoAnimate<HTMLDivElement>();

  const { data: lists } = api.lists.getBacklog.useQuery();

  const { data: sprints } = api.lists.getSprints.useQuery();

  // const { mutate: deleteGoal } = api.goals.delete.useMutation({
  //   onSuccess: () => {
  //     void ctx.goals.getGoals.invalidate();
  //   },
  // });

  return (
    <aside className="sidebar space-y-5 pr-10">
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
                      // variant={currentLists.includes(sprint.id) ? "secondary" : "ghost"}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs font-extrabold"
                      onClick={() => {
                        // selectSprint(sprint.id);
                        setCurrentContextMenuSprint(sprint.id);
                      }}
                      onAuxClick={() => {
                        // selectSprint(sprint.id); // do not fly to sprint here
                        setCurrentContextMenuSprint(sprint.id);
                      }}
                    >
                      <BikeIcon className="mr-2 h-4 w-4" />
                      <span className="uppercase">{sprint.title}</span>
                    </Button>
                  ))}
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
                      // variant={currentLists.includes(list.id) ? "secondary" : "ghost"}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs font-extrabold"
                      onClick={() => {
                        setCurrentContextMenuList(list.id);
                        // moveToList(list.id)
                      }}
                      onAuxClick={() => {
                        setCurrentContextMenuList(list.id);
                      }}
                    >
                      <ListIcon className="mr-2 h-4 w-4" />
                      <span className="uppercase">{list.title}</span>
                    </Button>
                  ))}
                </div>
              </ContextMenuTrigger>
              <ListContextMenu selectedListId={currentContextMenuList ?? null} />
            </ContextMenu>
          </div>
        </div>
        <div>
          {/* <h2 className="mb-2 flex flex-row items-center px-2 text-lg font-semibold tracking-tight">
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
          </div> */}
        </div>
      </div>
    </aside>
  );
}
