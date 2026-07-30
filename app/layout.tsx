import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import StoreProvider from "./StoreProvider";
import ThemeRegistry from "./ThemeRegistry";
import { ThemeContextProvider } from "./ThemeContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kanban App",
  description: "A kanban full stack app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body>
        <StoreProvider>
          <AppRouterCacheProvider>
            <ThemeContextProvider>
              <ThemeRegistry>
                <main>{children}</main>
              </ThemeRegistry>
            </ThemeContextProvider>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
