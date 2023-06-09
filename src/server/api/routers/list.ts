import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { CreateListSchema } from "~/utils/apischemas";

export const listsRouter = createTRPCRouter({
  getBacklog: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.list.findMany({
      where: {
        createdById: ctx.session.user.id,
        isSprint: false,
      },
    });
  }),

  getList: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.list.findFirst({
      where: { id: input },
      include: { items: true },
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
          isSprint: input.isSprint,
        },
      });

      // Creating list from existing items
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

  editList: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        startDate: z.date().optional(),
        dueDate: z.date().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.list.update({
        where: { id: input.id },
        data: {
          startDate: input.startDate,
          dueDate: input.dueDate,
        },
      });
    }),

  getSprints: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.list.findMany({
      where: {
        createdById: ctx.session.user.id,
        isSprint: true,
      },
    });
  }),
});
