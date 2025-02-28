import { RightSidebar } from "@/components/right-sidebar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative w-full border-x border-border lg:w-[610px]">
        {children}
      </div>
      <RightSidebar />
    </ >
  );
}

