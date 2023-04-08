import { type NextPage } from "next";
import { useState } from "react";
import { ItemsList } from "~/components/itemlist";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";

const BoardPage: NextPage = () => {
  const [newTitle, setNewTitle] = useState("");

  const { mutate: addItem } = api.lists.createItemInList.useMutation();

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900">
        <div className="flex flex-col">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Button
            onClick={() => {
              addItem({
                listId: "clg8advti0000vrwwqevvy0j7",
                item: { title: newTitle },
              });
              setNewTitle("");
            }}
          >
            +
          </Button>
        </div>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <ItemsList listId={"clg8advti0000vrwwqevvy0j7"} />
        </div>
      </main>
    </>
  );
};

export default BoardPage;
