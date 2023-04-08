import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const listsRouter = createTRPCRouter({
  getWithItems: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.list.findMany({include: {items: {include: {item: true}}}});
  }),
});
