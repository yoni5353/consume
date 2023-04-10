import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { DialogFooter, DialogHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { DialogProps } from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Item } from "@prisma/client";

type NewListFormData = {
  listName: string;
  initialItems: Item[];
};

export function CreateListDialog({
  onCreateList,
  onOpenChange,
  ...dialogProps
}: { onCreateList: SubmitHandler<NewListFormData> } & DialogProps) {
  const { register, handleSubmit, reset } = useForm<NewListFormData>();

  const handleClose = () => {
    reset();
    onOpenChange?.(false);
  };

  return (
    <Dialog
      {...dialogProps}
      onOpenChange={(value) => {
        reset();
        onOpenChange?.(value);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new list</DialogTitle>
          <DialogDescription>
            Create a new list. You can add items to it later.
            {/* Adds the following items... */}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onCreateList)}>
          <Label htmlFor="listName">List name</Label>
          <Input
            type="text"
            id="listName"
            {...register("listName", { required: true, maxLength: 256 })}
          />
          <DialogFooter>
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
