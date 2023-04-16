import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { exludeTemplateMetadta } from "./templateHelpers";
import { ProgressType } from "~/utils/progressType";

export const itemsRouter = createTRPCRouter({
  getItem: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.item.findUnique({
      where: { id: input },
      include: {
        progress: true,
      },
    });
  }),

  deleteItems: protectedProcedure
    .input(z.array(z.string()))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.deleteMany({
        where: { id: { in: input } },
      });
    }),

  // Only from one list to another
  // Since it disconnects the lists by the listId of the first item
  moveItems: protectedProcedure
    .input(
      z.object({
        targetListId: z.string(),
        itemIds: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prevListIdOfFirstItem = (
        await ctx.prisma.item.findFirst({
          where: { id: { in: input.itemIds } },
          select: { lists: { select: { listId: true } } },
        })
      )?.lists[0]?.listId;

      return ctx.prisma.itemsInLists.updateMany({
        where: {
          AND: { itemId: { in: input.itemIds }, listId: prevListIdOfFirstItem },
        },
        data: {
          listId: input.targetListId,
          assignedAt: new Date(),
        },
      });
    }),

  createItem: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        item: z.object({
          title: z.string().min(1),
          description: z.optional(z.string()),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          items: {
            create: {
              assignedBy: { connect: { id: ctx.session.user.id } },
              item: {
                create: {
                  title: input.item.title,
                  description: input.item.description,
                  createdBy: { connect: { id: ctx.session.user.id } },
                  progress: {
                    create: {
                      type: ProgressType.CHECK,
                      currentValue: 0,
                      maxValue: 1,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),

  createItemFromTemplate: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        templateId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.prisma.itemTemplate
        .findUnique({
          where: { id: input.templateId },
        })
        .then((template) => template && exludeTemplateMetadta(template));

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          items: {
            create: {
              assignedBy: { connect: { id: ctx.session.user.id } },
              item: {
                create: {
                  ...template,
                  progress: {
                    create: {
                      currentValue: 0,
                      maxValue: 1,
                    },
                  },
                  createdBy: { connect: { id: ctx.session.user.id } },
                },
              },
            },
          },
        },
      });
    }),

  switchProgressType: protectedProcedure
    .input(z.object({ itemId: z.string(), newProgressType: z.nativeEnum(ProgressType) }))
    .mutation(({ ctx, input }) => {
      const newMaxValue = input.newProgressType === ProgressType.CHECK ? 1 : 10;

      return ctx.prisma.item.update({
        where: { id: input.itemId },
        data: {
          progress: {
            update: {
              type: input.newProgressType,
              currentValue: 0,
              maxValue: newMaxValue,
            },
          },
        },
      });
    }),

  updateProgress: protectedProcedure
    .input(z.object({ itemId: z.string(), newProgress: z.number().min(0) }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.update({
        where: { id: input.itemId },
        data: {
          progress: {
            update: {
              currentValue: input.newProgress,
            },
          },
        },
        include: {
          progress: true,
        },
      });
    }),
});
