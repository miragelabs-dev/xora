import { ComposePostView } from "@/components/compose-post-view";
import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Compose Post',
  description: 'Create a new post',
};

export default function ComposePage() {
  return (
    <div>
      <PageHeader title="New Post" />
      <ComposePostView />
    </div>
  );
} 