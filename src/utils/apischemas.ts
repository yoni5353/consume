import { z } from "zod";

export const CreateListSchema = z.object({
    listTitle: z.string().min(1),
    initialItemsIds: z.optional(z.array(z.string())),
    originListId: z.optional(z.string()),
});

export type CreateListSechemaType = z.infer<typeof CreateListSchema>;
