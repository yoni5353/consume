import { z } from "zod";

export const CreateListSchema = z.object({
  listTitle: z.string().min(1),
  initialItemsIds: z.optional(z.array(z.string())),
  originListId: z.optional(z.string()),
  isSprint: z.optional(z.boolean()),
});

export type CreateListSechemaType = z.infer<typeof CreateListSchema>;

export const CreateGoalSchema = z.object({
  description: z.optional(z.string()),
  targetValue: z.optional(z.number()),
  mediaTypeId: z.optional(z.number()),
});

export type CreateGoalSchemaType = z.infer<typeof CreateGoalSchema>;
