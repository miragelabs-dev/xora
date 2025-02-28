import { NotificationsView } from "@/components/notifications-view";
import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Notifications",
};

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" />
      <NotificationsView />
    </div>
  );
}
