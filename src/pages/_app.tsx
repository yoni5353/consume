import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { Toaster } from "~/components/ui/toaster";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useEffect(() => {
    // Apply to whole body, including popovers
    document.querySelector("body")?.classList.add("dark");
  }, []);

  return (
    <>
      <SessionProvider session={session}>
        <ThemeProvider>
          <ReactQueryDevtools />
          <Component {...pageProps} />
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
