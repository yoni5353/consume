import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const itemsRouter = createTRPCRouter({
  getItem: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.item.findUnique({
      where: { id: input },
    });
  }),

  deleteItems: protectedProcedure
    .input(z.array(z.string()))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.deleteMany({
        where: { id: { in: input } },
      });
    }),

  // Only from one list to another
  // Since it disconnects the lists by the listId of the first item
  moveItems: protectedProcedure
    .input(
      z.object({
        targetListId: z.string(),
        itemIds: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prevListIdOfFirstItem = (
        await ctx.prisma.item.findFirst({
          where: { id: { in: input.itemIds } },
          select: { lists: { select: { listId: true } } },
        })
      )?.lists[0]?.listId;

      return ctx.prisma.itemsInLists.updateMany({
        where: {
          AND: { itemId: { in: input.itemIds }, listId: prevListIdOfFirstItem },
        },
        data: {
          listId: input.targetListId,
          assignedAt: new Date(),
        },
      });
    }),
});
