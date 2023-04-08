import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const listsRouter = createTRPCRouter({
  getUserLists: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.list.findMany({
        where: {
          createdById: ctx.session.user.id
        },
      });
    }),

  getWithItems: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.prisma.list.findFirst({
        where: {id: input},
        include: {items: {include: {item: true}}}
      });
    }),

  createItemInList: protectedProcedure
    .input(z.object({
      listId: z.string(),
      item: z.object({
        title: z.string(),
        description: z.optional(z.string()),
      }),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.update({
        where: {id: input.listId},
        data: {
          items: {
            create: {
              assignedBy: {connect: {id: ctx.session.user.id}},
              item: {
                create: {
                  title: input.item.title,
                  description: input.item.description,
                  createdBy: {connect: {id: ctx.session.user.id}},
                }
              }
            }
          }
        }
      });
    })
});
