import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { exludeTemplateMetadta } from "./templateHelpers";
import { ProgressType, defaultProgressMaxValues } from "~/utils/progress";
import { type PartialItem, getItemFromLink } from "~/utils/scrapers/main";

export const itemsRouter = createTRPCRouter({
  getItem: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.item.findUnique({
      where: { id: input },
      include: {
        progress: true,
        mediaType: true,
        tags: true,
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

      const { seriesId: _, progressType, mediaTypeId, ...itemArgs } = template;

      const newProgressType = Object.values(ProgressType).includes(
        progressType as ProgressType
      )
        ? (progressType as ProgressType)
        : ProgressType.CHECK;

      const progressArgs = {
        type: newProgressType,
        currentValue: 0,
        maxValue: defaultProgressMaxValues[newProgressType],
      };

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          items: {
            create: {
              assignedBy: { connect: { id: ctx.session.user.id } },
              item: {
                create: {
                  ...itemArgs,
                  progress: {
                    create: progressArgs,
                  },
                  mediaType: mediaTypeId ? { connect: { id: mediaTypeId } } : undefined,
                  createdBy: { connect: { id: ctx.session.user.id } },
                },
              },
            },
          },
        },
      });
    }),

  createItemFromLink: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        link: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let partialItem: PartialItem;
      try {
        partialItem = await getItemFromLink(input.link);
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch data from link",
        });
      }

      const progressMaxValue = partialItem?.progress?.maxValue ?? 1;
      const progressType =
        progressMaxValue > 1 ? ProgressType.SLIDER : ProgressType.CHECK;

      const partialProgress = {
        currentValue: 0,
        maxValue: 1,
        ...partialItem?.progress,
        type: progressType,
      };

      const mediaTypeConnection = partialItem.mediaType
        ? {
            id: (
              await ctx.prisma.mediaType.findFirstOrThrow({
                where: { name: partialItem.mediaType.name },
              })
            ).id,
          }
        : undefined;

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          items: {
            create: {
              assignedBy: { connect: { id: ctx.session.user.id } },
              item: {
                create: {
                  ...partialItem,
                  progress: {
                    create: {
                      ...partialProgress,
                    },
                  },
                  createdBy: { connect: { id: ctx.session.user.id } },
                  mediaType: { connect: mediaTypeConnection },
                },
              },
            },
          },
        },
      });
    }),

  editItem: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        title: z.optional(z.string().min(1)),
        description: z.optional(z.string()),
        mediaTypeId: z.optional(z.number().nullable()),
        tags: z.optional(z.array(z.string())),
        link: z.optional(z.string()),
        image: z.optional(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mediaTypeConnection =
        input.mediaTypeId === undefined
          ? {}
          : input.mediaTypeId === null
          ? { disconnect: true }
          : { connect: { id: input.mediaTypeId } };

      const item = await ctx.prisma.item.findUnique({
        where: { id: input.itemId },
        select: { tags: { select: { name: true } } },
      });

      const removedTags = item?.tags
        .map((tag) => tag.name)
        .filter((tag) => {
          return !input.tags?.includes(tag);
        });

      return ctx.prisma.item.update({
        where: { id: input.itemId },
        data: {
          title: input.title || undefined,
          description: input.description || undefined,
          link: input.link || undefined,
          image: input.image || undefined,
          mediaType: mediaTypeConnection,
          tags: {
            disconnect: removedTags?.map((tag) => ({ name: tag })),
            connectOrCreate: input.tags?.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
      });
    }),

  switchProgress: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        newProgressType: z.optional(z.nativeEnum(ProgressType)),
        newMaxValue: z.optional(z.number().min(0)),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentProgress = (
        await ctx.prisma.item.findUnique({
          where: { id: input.itemId },
          select: { progress: true },
        })
      )?.progress;

      if (!currentProgress) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Progress not found" });
      }

      if (input.newProgressType && input.newProgressType !== currentProgress.type) {
        const newCurrentValue =
          input.newProgressType === ProgressType.PERCENTAGE
            ? (currentProgress.currentValue / currentProgress.maxValue) * 100
            : 0;

        return ctx.prisma.item.update({
          where: { id: input.itemId },
          data: {
            progress: {
              update: {
                type: input.newProgressType,
                currentValue: newCurrentValue,
                maxValue:
                  input.newMaxValue ?? defaultProgressMaxValues[input.newProgressType],
              },
            },
          },
        });
      } else if (!!input.newMaxValue) {
        return ctx.prisma.item.update({
          where: { id: input.itemId },
          data: {
            progress: {
              update: {
                currentValue: Math.min(currentProgress.currentValue, input.newMaxValue),
                maxValue: input.newMaxValue,
              },
            },
          },
        });
      } else {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
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

  getRecentItems: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.item.findMany({
      where: {
        createdBy: { id: ctx.session.user.id },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        progress: true,
        mediaType: true,
        tags: true,
      },
    });
  }),
});
