import { ListIcon } from "lucide-react";
import { type NextPage } from "next";
import { useState } from "react";
import { ItemsList } from "~/components/itemlist";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const BoardPage: NextPage = () => {
  const [currentLists, setCurrentLists] = useState<string[]>([]);

  const { data: lists } = api.lists.getUserLists.useQuery();

  if (lists && currentLists.length === 0) {
    if (lists.length) {
      setCurrentLists([lists[0]!.id]);
    }
  }

  return (
    <main className="flex min-h-screen flex-row bg-gradient-to-b from-rose-500 to-indigo-700">
      <div className="mx-3 mt-3 grid h-[97vh] w-full grid-cols-4 rounded-md bg-slate-900 p-5 xl:grid-cols-5 ">
        <aside className="space-y-5 pr-10">
          <h1 className="align-center mb-2 flex flex-row px-2 text-2xl font-extrabold tracking-tight">
            CONSUME
          </h1>
          <div>
            <h2 className="align-center mb-2 flex flex-row px-2 text-lg font-semibold tracking-tight">
              Lists
            </h2>
            <div className="space-y-2">
              {lists?.map((list) => (
                <Button
                  key={list.id}
                  variant={currentLists.includes(list.id) ? "subtle" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setCurrentLists([list.id])}
                >
                  <ListIcon className="mr-2 h-4 w-4" />
                  {list.title}
                </Button>
              ))}
            </div>
          </div>
        </aside>
        <div className="col-span-3 border-l border-slate-500 xl:col-span-4">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
            {currentLists[0] && <ItemsList listId={currentLists[0]} />}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BoardPage;
