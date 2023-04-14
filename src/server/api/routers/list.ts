import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { CreateListSchema } from "~/utils/apischemas";

export const listsRouter = createTRPCRouter({
  getUserLists: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.list.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
    });
  }),

  getWithItems: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.list.findFirst({
      where: { id: input },
      include: { items: { include: { item: true } } },
    });
  }),

  createList: protectedProcedure
    .input(CreateListSchema)
    .mutation(async ({ ctx, input }) => {
      const newList = await ctx.prisma.list.create({
        data: {
          title: input.listTitle,
          createdBy: { connect: { id: ctx.session.user.id } },
          items: {
            create: input.initialItemsIds?.map((id) => ({
              assignedBy: { connect: { id: ctx.session.user.id } },
              item: { connect: { id } },
            })),
          },
        },
      });

      if (input.initialItemsIds && input.originListId) {
        await ctx.prisma.itemsInLists.deleteMany({
          where: {
            AND: { itemId: { in: input.initialItemsIds }, listId: input.originListId },
          },
        });
      }

      return newList;
    }),

  deleteList: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.list.delete({
      where: { id: input },
    });
  }),
});
