import { type NextPage } from "next";
import { useState } from "react";
import { ItemsList } from "~/components/itemlist";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";

const BoardPage: NextPage = () => {
  const [newTitle, setNewTitle] = useState("");
  const [currentLists, setCurrentLists] = useState<string[]>([]);

  const { data: lists } = api.lists.getUserLists.useQuery();

  if (lists && currentLists.length === 0) {
    if (lists.length) {
      setCurrentLists([lists[0]!.id]);
    }
  }

  const { mutate: addItem } = api.lists.createItemInList.useMutation();

  return (
    <>
      <main className="flex min-h-screen flex-row items-center justify-center bg-slate-900">
        <div className="ml-10 flex w-36 flex-col space-y-4">
          {lists?.map((list) => (
            <Button
              key={list.id}
              variant={currentLists.includes(list.id) ? "subtle" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentLists([list.id])}
            >
              {list.title}
            </Button>
          ))}
        </div>
        <div className="flex flex-col">
          {/* <Input
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
          </Button> */}
        </div>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {currentLists[0] && <ItemsList listId={currentLists[0]} />}
        </div>
      </main>
    </>
  );
};

export default BoardPage;
