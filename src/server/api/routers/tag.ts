import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const tagsRouter = createTRPCRouter({
  getAllUserTags: protectedProcedure.query(async ({ ctx }) => {
    const userTags = (
      await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { Item: { select: { tags: { select: { name: true } } } } },
      })
    )?.Item.flatMap((item) => item.tags).map((tag) => tag.name);

    return userTags;
  }),
});
