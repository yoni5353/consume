/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { DialogFooter, DialogHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateListSchema, type CreateListSechemaType } from "~/utils/apischemas";

export function CreateListDialog({
  onCreateList,
  onOpenChange,
  hasInitialItems,
  isCreatingSprint,
  ...dialogProps
}: {
  onCreateList: SubmitHandler<CreateListSechemaType>;
  hasInitialItems: boolean;
  isCreatingSprint: boolean;
} & DialogProps) {
  const { register, handleSubmit, reset } = useForm<CreateListSechemaType>({
    resolver: zodResolver(CreateListSchema),
  });

  const handleClose = () => {
    reset();
    onOpenChange?.(false);
  };

  const onSubmit = (data: CreateListSechemaType) => {
    onCreateList(data);
    reset();
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
          <DialogTitle>Create new {isCreatingSprint ? "sprint" : "list"}</DialogTitle>
          <DialogDescription>
            {hasInitialItems
              ? "Create a new list initialized with the chosen items."
              : "Create a new list. You can add items to it later."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="mx-10 flex flex-row items-center space-x-4">
            <Label htmlFor="listName" className="items-center text-right uppercase">
              Title
            </Label>
            <Input
              type="text"
              id="listName"
              {...register("listTitle", { required: true, maxLength: 256 })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
