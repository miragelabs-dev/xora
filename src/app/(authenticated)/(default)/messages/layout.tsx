import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your private messages",
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader title="Messages" />
      <div className="grid grid-cols-1 flex-1 md:grid-cols-[380px_1fr] h-[calc(100vh-120px)]">
        {children}
      </div>
    </>
  );
} 