import { TRPCError } from "@trpc/server";
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
      include: { items: { orderBy: [{ position: "asc" }, { assignedAt: "desc" }] } },
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

  orderList: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        itemIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          items: {
            updateMany: input.itemIds.map((itemId, index) => ({
              where: { itemId: itemId },
              data: { position: index },
            })),
          },
        },
      });
    }),

  moveItems: protectedProcedure
    .input(
      z.object({
        targetListId: z.string(),
        prevConnections: z.array(
          z.object({
            itemId: z.string(),
            listId: z.string(),
          })
        ),
        insertAt: z.optional(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const targetList = await ctx.prisma.list.findFirst({
        where: { id: input.targetListId },
        include: {
          items: {
            orderBy: [{ position: "asc" }, { assignedAt: "desc" }],
            select: { itemId: true },
          },
        },
      });

      if (!targetList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Target list not found",
        });
      }

      const targetListCurrentItemIds = targetList.items.map(({ itemId }) => itemId);

      await Promise.all(
        input.prevConnections.map(async ({ itemId, listId }) => {
          if (listId !== input.targetListId) {
            await ctx.prisma.itemsInLists.delete({
              where: {
                itemId_listId: {
                  itemId,
                  listId,
                },
              },
            });
          }
        })
      );

      const itemIdsToInsert = input.prevConnections.map(({ itemId }) => itemId);
      const newItemIds = targetListCurrentItemIds.filter(
        (id) => !itemIdsToInsert.includes(id)
      );
      newItemIds.splice(input.insertAt ?? 0, 0, ...itemIdsToInsert);

      return ctx.prisma.list.update({
        where: { id: input.targetListId },
        data: {
          items: {
            upsert: newItemIds.map((itemId, position) => ({
              where: {
                itemId_listId: { itemId, listId: input.targetListId },
              },
              update: { position: { set: position } },
              create: {
                item: { connect: { id: itemId } },
                assignedBy: { connect: { id: ctx.session.user.id } },
                assignedAt: new Date(),
                position,
              },
            })),
          },
        },
      });
    }),
});
