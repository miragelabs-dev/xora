import { validateRequest } from "@/lib/session";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "./session-provider";
import { TRPCProvider } from './trpc-provider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await validateRequest()

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider session={session}>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

export default RootLayout
