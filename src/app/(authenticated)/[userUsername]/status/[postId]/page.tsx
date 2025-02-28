import { PageHeader } from "@/components/page-header";
import { PostDetailView } from "@/components/post-detail-view";
import { Metadata } from "next";

type Params = Promise<{ userUsername: string, postId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { userUsername } = await params;

  return {
    title: `Post by @${userUsername}`,
    description: `View post by @${userUsername}`,
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { postId } = await params;

  return (
    <div>
      <PageHeader title="Post" />
      <PostDetailView postId={postId} />
    </div>
  );
} 