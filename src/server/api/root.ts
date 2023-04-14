import { createTRPCRouter } from "~/server/api/trpc";
import { listsRouter } from "~/server/api/routers/list";
import { itemsRouter } from "./routers/item";
import { templatesRouter } from "./routers/template";

export const appRouter = createTRPCRouter({
  lists: listsRouter,
  items: itemsRouter,
  templates: templatesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
