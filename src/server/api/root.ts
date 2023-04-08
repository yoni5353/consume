import { createTRPCRouter } from "~/server/api/trpc";
import { listsRouter } from "~/server/api/routers/list";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  lists: listsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
