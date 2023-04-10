import moment from "moment";
import { api } from "~/utils/api";

export function ItemDisplay({ itemId }: { itemId: string }) {
  const item = api.items.getItem.useQuery(itemId).data;

  if (!item) return null;

  return (
    <div className="flex flex-col gap-5">
      <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
        {item.title}
      </h3>
      {item.description && <p>{item.description}</p>}
      <p className="text-slate-500">
        Created {moment(item.createdAt).fromNow()}
      </p>
    </div>
  );
}