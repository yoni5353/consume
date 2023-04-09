import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const itemsRouter = createTRPCRouter({
  getItem: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.prisma.item.findUnique({
        where: { id: input },
      });
    }),

  deleteItems: protectedProcedure
    .input(z.array(z.string()))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.deleteMany({
        where: {id: {in: input}}
      });
    })
});
