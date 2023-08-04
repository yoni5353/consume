import { Loader2Icon } from "lucide-react";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { TopBar } from "~/components/views/topbar";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { ListPageContent } from "~/components/views/listPageContent";

const ListPage: NextPage = () => {
  const { data: sessionData, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn(undefined, { callbackUrl: "/list" });
    }
  }, []);

  if (!sessionData) {
    return <Loader2Icon className="m-auto min-h-screen animate-spin" />;
  }

  return <LoadedListPage />;
};

const DEFAULT_COLORS: [string, string] = ["#3b82f6", "#76b9ce"];

const LoadedListPage: React.FC = () => {
  const [gradientColors, setGradientColors] = useState<[string, string]>(DEFAULT_COLORS);
  const [currentLayout, setCurrentLayout] = useState<"list" | "grid">("list");

  return (
    <>
      <Head>
        <title>CONSUME</title>
        <meta name="description" content="Consume List" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main
        className="flex min-h-screen flex-row"
        style={{
          backgroundImage: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`,
        }}
      >
        <div className="m-3 flex w-full flex-col overflow-hidden rounded-md bg-background">
          {/* TOPBAR */}
          <TopBar
            onLayoutChange={setCurrentLayout}
            gradientColorsState={[gradientColors, setGradientColors]}
          />

          {/* LIST */}
          <ListPageContent layout={currentLayout} />
        </div>
      </main>
    </>
  );
};

export default ListPage;
