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

  searchStories: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.story.findMany({
      where: {
        title: {
          contains: input,
        },
      },
    });
  }),

  getStory: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.story.findUnique({
      where: {
        id: input,
      },
      include: {
        series: {
          include: {
            templates: true,
          },
        },
      },
    });
  }),
});
