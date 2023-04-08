import { api } from "~/utils/api";
import { ItemCard } from "./itemcard";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm, SubmitHandler } from "react-hook-form";

export function ItemsList({ listId }: { listId: string }) {
  const { register, handleSubmit, reset } = useForm<{ itemTitle: string }>();

  const onCreateItem: SubmitHandler<{ itemTitle: string }> = (data) => {
    addItem({
      listId,
      item: { title: data.itemTitle },
    });
    reset();
  };

  const { mutate: deleteItem } = api.items.deleteItem.useMutation({
    onSuccess: () => refetch(),
  });

  const { data: listWithItems, refetch } =
    api.lists.getWithItems.useQuery(listId);

  const { mutate: addItem } = api.lists.createItemInList.useMutation({
    onSuccess: () => refetch(),
  });

  const items = listWithItems?.items;

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit(onCreateItem)} className="flex flex-row">
        <Input {...register("itemTitle")} />
        <Button type="submit">+</Button>
      </form>
      {items?.map((item) => (
        <ItemCard
          item={item.item}
          key={item.itemId}
          onDelete={() => deleteItem(item.itemId)}
        />
      ))}
    </div>
  );
}
