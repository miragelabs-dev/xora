import { Navbar } from "@/components/navbar";
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
            <div className="mx-auto flex min-h-[100svh] max-w-[1350px] flex-col flex-nowrap items-stretch justify-center sm:flex-row">
              <Navbar />
              <main className={"flex flex-grow-[2]"}>
                <div className="relative w-full sm:w-[610px] sm:border-x sm:border-dark-gray">
                  {children}
                </div>
              </main>
            </div>
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

// TODO: Add TRPC provider
// export default api.withTRPC(RootLayout)

export default RootLayout
