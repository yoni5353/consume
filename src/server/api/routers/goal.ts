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
});
