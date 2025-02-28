import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";
import { SessionProvider } from "../session-provider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className={cn(
        "mx-auto flex min-h-[100svh] max-w-[1200px] flex-col flex-nowrap items-stretch justify-center pb-14 lg:flex-row lg:pb-0",
      )}>
        <Navbar />
        <main className="flex flex-grow w-full">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}

