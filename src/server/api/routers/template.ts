import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const templatesRouter = createTRPCRouter({
  searchItemTemplates: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.itemTemplate.findMany({
      where: {
        title: {
          contains: input,
          mode: "insensitive",
        },
      },
    });
  }),

  searchStories: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.story.findMany({
      where: {
        title: {
          contains: input,
          mode: "insensitive",
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
        loneTemplates: true,
        series: {
          include: {
            templates: true,
          },
        },
      },
    });
  }),

  createTemplateFromItem: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        link: z.string(),
        image: z.string(),
        tags: z.array(z.string()),
        progressType: z.string(),
        mediaTypeId: z.optional(z.number()),
      })
    )
    .mutation(({ ctx, input }) => {
      const mediaTypeConnection = input.mediaTypeId
        ? { connect: { id: input.mediaTypeId } }
        : undefined;

      return ctx.prisma.itemTemplate.create({
        data: {
          createdBy: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          title: input.title,
          link: input.link,
          image: input.image,
          // TODO
          // tags: {
          //   connect: input.tags.map((tag) => ({ name: tag }))
          // },
          progressType: input.progressType,
          mediaType: mediaTypeConnection,
        },
      });
    }),
});
