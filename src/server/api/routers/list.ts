import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const listsRouter = createTRPCRouter({
  getWithItems: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
    return ctx.prisma.list.findFirst({
      where: {id: input},
      include: {items: {include: {item: true}}}
    });
  }),
});
