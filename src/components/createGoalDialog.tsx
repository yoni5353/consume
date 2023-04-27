/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { DialogFooter, DialogHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import { Controller, useForm } from "react-hook-form";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateGoalSchema, type CreateGoalSchemaType } from "~/utils/apischemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { MediaTypeIcon } from "./resources/mediaTypeIcon";
import { api } from "~/utils/api";

export function CreateGoalDialog({ onOpenChange, ...dialogProps }: DialogProps) {
  const ctx = api.useContext();

  const { mutate: createGoal } = api.goals.create.useMutation({
    onSuccess: () => {
      onOpenChange?.(false);
      void ctx.goals.getGoals.invalidate();
    },
  });

  const { data: mediaTypes } = api.mediaTypes.getAll.useQuery();

  const { register, handleSubmit, reset, control } = useForm<CreateGoalSchemaType>({
    resolver: zodResolver(CreateGoalSchema),
  });

  const handleClose = () => {
    reset();
    onOpenChange?.(false);
  };

  const onSubmit = (data: CreateGoalSchemaType) => {
    createGoal(data);
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
          <DialogTitle>Set New Goal</DialogTitle>
          <DialogDescription>Set a new goal for a certain time period.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-row items-center space-x-4">
            <div className="flex flex-row space-x-2">
              <div>I want to</div>
              <div className="font-extrabold uppercase">consume</div>
            </div>
            <Input
              className="w-20"
              type="number"
              min={1}
              max={1024}
              defaultValue={2}
              {...register("targetValue", {
                required: true,
                min: 1,
                max: 1024,
                valueAsNumber: true,
              })}
            />
            <Controller
              control={control}
              name="mediaTypeId"
              defaultValue={-1}
              render={({ field }) => {
                // Filter out ref for Radix's forwardRef (causes error)
                const { ref, ...filteredField } = field;

                return (
                  <Select
                    {...filteredField}
                    value={filteredField.value?.toString()}
                    onValueChange={(newValue) => filteredField.onChange(+newValue)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">
                        <div className="flex items-center space-x-2">
                          <MediaTypeIcon mediaType={undefined} className="mr-2" />
                          Any Item
                        </div>
                      </SelectItem>
                      {mediaTypes?.map((mediaType) => (
                        <SelectItem key={mediaType.id} value={mediaType.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <MediaTypeIcon mediaType={mediaType} className="mr-2" />
                            {mediaType.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Set Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
