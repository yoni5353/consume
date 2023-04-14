import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const templatesRouter = createTRPCRouter({
  searchItemTemplates: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.itemTemplate.findMany({
      where: {
        title: {
          contains: input,
        },
      },
    });
  }),
});
