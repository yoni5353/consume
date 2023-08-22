import { uniq } from "lodash";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const tagsRouter = createTRPCRouter({
  getAllUserTags: protectedProcedure.query(async ({ ctx }) => {
    return uniq(
      (
        await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { Item: { select: { tags: { select: { name: true } } } } },
        })
      )?.Item.flatMap((item) => item.tags).map((tag) => tag.name)
    );
  }),

  getUserTagColors: protectedProcedure.query(async ({ ctx }) => {
    return (
      await ctx.prisma.userTagColor.findMany({
        where: { userId: ctx.session.user.id },
        select: { tag: { select: { name: true } }, color: true },
      })
    ).reduce(
      (acc, curr) => ({ ...acc, [curr.tag.name]: curr.color }),
      {} as { [tagName: string]: string }
    );
  }),

  updateTagColor: protectedProcedure
    .input(z.object({ tag: z.string(), color: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userTagColor.upsert({
        where: { userId_tagId: { userId: ctx.session.user.id, tagId: input.tag } },
        update: { color: input.color },
        create: {
          color: input.color,
          user: { connect: { id: ctx.session.user.id } },
          tag: {
            connectOrCreate: { where: { name: input.tag }, create: { name: input.tag } },
          },
        },
      });
    }),

  removeTagColor: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userTagColor.delete({
        where: { userId_tagId: { userId: ctx.session.user.id, tagId: input } },
      });
    }),
});
