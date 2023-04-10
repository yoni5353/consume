import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { CreateListSchema } from "~/utils/apischemas";

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

  createList: protectedProcedure
    .input(CreateListSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.create({
        data: {
          title: input.listTitle,
          createdBy: {connect: {id: ctx.session.user.id}},
          items: {
            create: input.initialItemsIds?.map((id) => ({
              assignedBy: {connect: {id: ctx.session.user.id}},
              item: {connect: {id}}
            }))
          }
        }
      });
    }),

  createItemInList: protectedProcedure
    .input(z.object({
      listId: z.string(),
      item: z.object({
        title: z.string().min(1),
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
