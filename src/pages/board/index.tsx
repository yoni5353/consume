import { type NextPage } from "next";
import { ItemsList } from "~/components/itemlist";

const BoardPage: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900">
        <h1>Consume board</h1>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <ItemsList listId={"clg7zq10d0004vrdgnrbfq8cl"} />
        </div>
      </main>
    </>
  );
};

export default BoardPage;
