import { Playfair_Display, Roboto } from "next/font/google";
import { cookies } from "next/headers";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/context/theme-context";
import { UserProvider } from "@/context/user-context";
import { parseThemeMode, THEME_COOKIE } from "@/lib/theme-cookie";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Truth Lens",
  description: "A web application to detect AI generated images",
  icons: {
    icon: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialMode = parseThemeMode(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={`${roboto.variable} ${playfair.variable}`}
      data-theme={initialMode}
    >
      <body>
        <UserProvider>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <ThemeProvider initialMode={initialMode}>
              <Toaster position="bottom-right" />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </UserProvider>
      </body>
    </html>
  );
}
