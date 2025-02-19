"use client";

import { Navbar } from "@/components/navbar";
import { api } from "@/utils/api";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="mx-auto flex min-h-[100svh] max-w-[1350px] flex-col flex-nowrap items-stretch justify-center sm:flex-row">
          <Navbar />
          <main className={"flex flex-grow-[2]"}>
            <div className="relative w-full sm:w-[610px] sm:border-x sm:border-dark-gray">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

export default api.withTRPC(RootLayout);
