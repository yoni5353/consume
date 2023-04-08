import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const listsRouter = createTRPCRouter({
  getWithItems: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.list.findFirst({
      include: {items: {include: {item: true}}}
    });
  }),
});
