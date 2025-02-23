import { Navbar } from "@/components/navbar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-[100svh] max-w-[1350px] flex-col flex-nowrap items-stretch justify-center sm:flex-row">
      <Navbar />
      <main className={"flex flex-grow-[2]"}>
        <div className="relative w-full sm:w-[610px] sm:border-x sm:border-dark-gray">
          {children}
        </div>
      </main>
    </div>
  );
}

