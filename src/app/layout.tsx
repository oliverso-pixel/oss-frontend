// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pet Social Platform",
  description: "一個為寵物愛好者打造的社交平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

