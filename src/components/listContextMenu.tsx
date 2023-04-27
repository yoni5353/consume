import { Trash2 } from "lucide-react";
import { ContextMenuContent, ContextMenuItem } from "./ui/context-menu";
import { api } from "~/utils/api";

export function ListContextMenu({
  selectedListId,
  onDelete,
}: {
  selectedListId?: string;
  onDelete: () => void;
}) {
  const ctx = api.useContext();

  const { mutate: deleteList } = api.lists.deleteList.useMutation({
    onSuccess: () => {
      void ctx.lists.invalidate();
      onDelete();
    },
  });

  return (
    <ContextMenuContent>
      <ContextMenuItem
        onSelect={() => {
          selectedListId && deleteList(selectedListId);
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" /> Delete List
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
