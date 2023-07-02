import { type Progress, type Item, type MediaType, type Tag } from "@prisma/client";
import { api } from "~/utils/api";
import { useToast } from "../ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Settings2Icon, ShieldIcon } from "lucide-react";
import { Button } from "../ui/button";

export function ItemDialogDropdown({
  item,
}: {
  item: Item & { progress: Progress; mediaType: MediaType | null; tags: Tag[] };
}) {
  const { toast } = useToast();

  const { mutate: generateTemplate } = api.templates.createTemplateFromItem.useMutation({
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "A template was created from this item.",
      });
    },
    onError: (error) => {
      toast({
        title: "Template creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="dialog" className="h-min w-min p-0">
          <Settings2Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() =>
              generateTemplate({
                ...item,
                progressType: item.progress.type,
                tags: item.tags.map((tag) => tag.name),
                mediaTypeId: item.mediaType?.id ?? undefined,
              })
            }
          >
            <ShieldIcon className="mr-2 h-4 w-4" />
            <span>Generate Template</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
