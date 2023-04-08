import { type NextPage } from "next";
import Link from "next/link";
import { ItemsList } from "~/components/itemlist";
import { Button } from "~/components/ui/button";

import { api } from "~/utils/api";

const BoardPage: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <h1>Consume board</h1>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <ItemsList />
        </div>
      </main>
    </>
  );
};

export default BoardPage;
