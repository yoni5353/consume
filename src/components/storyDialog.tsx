import { type Story } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { type DialogProps } from "@radix-ui/react-dialog";

export function StoryDialog({ story, ...dialogProps }: { story: Story } & DialogProps) {
  return (
    <Dialog {...dialogProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{story.title}</DialogTitle>
          <DialogDescription>{story.description}</DialogDescription>
        </DialogHeader>
        <div>Story content</div>
      </DialogContent>
    </Dialog>
  );
}
