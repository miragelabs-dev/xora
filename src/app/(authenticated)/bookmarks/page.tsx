import { BookmarksView } from "@/components/bookmarks-view";
import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Bookmarks',
  description: 'Your saved posts',
};

export default function BookmarksPage() {
  return (
    <div>
      <PageHeader title="Bookmarks" />
      <BookmarksView />
    </div>
  );
}