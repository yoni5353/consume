import { createTRPCRouter } from "~/server/api/trpc";
import { listsRouter } from "~/server/api/routers/list";
import { itemsRouter } from "./routers/item";
import { templatesRouter } from "./routers/template";
import { mediaTypesRouter } from "./routers/mediaTypes";
import { goalsRouter } from "./routers/goal";
import { tagsRouter } from "./routers/tag";

export const appRouter = createTRPCRouter({
  lists: listsRouter,
  items: itemsRouter,
  templates: templatesRouter,
  mediaTypes: mediaTypesRouter,
  goals: goalsRouter,
  tags: tagsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
