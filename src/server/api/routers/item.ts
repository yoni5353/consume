import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const itemsRouter = createTRPCRouter({
  deleteItem: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.delete({
        where: {id: input}
      });
    })
});
