import { getAddress } from "@chopinframework/next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./session-provider";
import { TRPCProvider } from './trpc-provider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const address = await getAddress()

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider address={address}>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
