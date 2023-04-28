import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { CreateGoalSchema } from "~/utils/apischemas";

export const goalsRouter = createTRPCRouter({
  create: protectedProcedure.input(CreateGoalSchema).mutation(({ ctx, input }) => {
    const targetMediaType =
      input.mediaTypeId && input.mediaTypeId >= 0
        ? { connect: { id: input.mediaTypeId } }
        : undefined;

    return ctx.prisma.goal.create({
      data: {
        createdBy: { connect: { id: ctx.session.user.id } },
        description: input.description,
        targetValue: input.targetValue ?? 1,
        targetMediaType,
      },
    });
  }),

  getGoals: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.goal.findMany({
      where: { createdById: ctx.session.user.id },
      include: { targetMediaType: true },
    });
  }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.goal.delete({
      where: { id: input },
    });
  }),
});
