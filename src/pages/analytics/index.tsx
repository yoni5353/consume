import { type NextPage } from "next";
import { useState } from "react";
import { TopBar } from "~/components/views/topbar";
import Head from "next/head";
import { RecentItems } from "~/components/analytics/recentItems";

const DEFAULT_COLORS: [string, string] = ["#3b82f6", "#76b9ce"];

const AnalyticsPage: NextPage = () => {
  const [gradientColors, setGradientColors] = useState<[string, string]>(DEFAULT_COLORS);

  return (
    <>
      <Head>
        <title>CONSUME</title>
        <meta name="description" content="Consume Analaytics" />
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
            onLayoutChange={() => console.log("temp")}
            gradientColorsState={[gradientColors, setGradientColors]}
          />

          <div className="main-grid grid h-full w-full grid-cols-5 px-5 xl:grid-cols-6">
            {/* NAVBAR */}
            <div></div>

            <RecentItems />
          </div>
        </div>
      </main>
    </>
  );
};

export default AnalyticsPage;
