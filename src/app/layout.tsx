// src/app/layout.tsx
import type { Metadata } from "next";
import { Noto_Sans_KR, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import AppShell from "@/components/layout/AppShell";
import Provider from "@/components/layout/Provider";

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "noti",
  description: "잊지 않게, 대신 챙겨줘 — 실행 중심 알림 앱",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${noto.className} ${geistMono.variable} min-h-dvh bg-white text-gray-900 antialiased`}
      >
        <Provider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
