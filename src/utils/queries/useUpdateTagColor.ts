import { api } from "~/utils/api";

export function useUpdateTagColor() {
  const ctx = api.useContext();

  return api.tags.updateTagColor.useMutation({
    onMutate: async ({ tag, color }) => {
      await ctx.tags.getUserTagColors.cancel();
      ctx.tags.getUserTagColors.setData(undefined, (prev) => ({ ...prev, [tag]: color }));
    },
  });
}
