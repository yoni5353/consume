import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { exludeTemplateMetadta } from "./templateHelpers";
import { ProgressType, defaultProgressMaxValues } from "~/utils/progress";
import { type PartialItem, getItemFromLink } from "~/utils/scrapers/main";
import { SwitchProgressSchema, switchProgress } from "~/utils/items/switchProgress";

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

  createItem: protectedProcedure
    .input(
      z.object({
        listId: z.string(),
        item: z.object({
          title: z.string().min(1),
          notes: z.optional(z.string()),
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
                  notes: input.item.notes,
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

      const {
        seriesId: _,
        progressType,
        mediaTypeId,
        metaDescription: __,
        storyId: ___,
        description: ____,
        ...itemArgs
      } = template;

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
                  template: { connect: { id: input.templateId } },
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
        notes: z.optional(z.string()),
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

      return ctx.prisma.item.update({
        where: { id: input.itemId },
        data: {
          title: input.title || undefined,
          notes: input.notes || undefined,
          link: input.link || undefined,
          image: input.image || undefined,
          mediaType: mediaTypeConnection,
          tags: {
            deleteMany: { name: { notIn: input.tags } },
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
      SwitchProgressSchema.and(
        z.object({
          itemId: z.string(),
        })
      )
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

      const newProgress = switchProgress(currentProgress, input);

      return ctx.prisma.item.update({
        where: { id: input.itemId },
        data: {
          progress: {
            update: newProgress,
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

  changeStatus: protectedProcedure
    .input(
      z.object({
        itemIds: z.array(z.string()),
        newStatus: z.enum(["DEFAULT", "CANCELLED"]),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.updateMany({
        where: { id: { in: input.itemIds } },
        data: {
          status: input.newStatus,
        },
      });
    }),
});
