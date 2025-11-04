import { CommunityView } from "@/components/community-view";
import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = Promise<{ communityId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { communityId } = await params;

  return {
    title: `Community ${communityId}`,
    description: `Community ${communityId} details`,
  };
}

export default async function CommunityPage({ params }: { params: Params }) {
  const { communityId } = await params;
  const id = Number(communityId);

  if (Number.isNaN(id)) {
    return notFound();
  }

  return (
    <div>
      <PageHeader title="Community" />
      <CommunityView communityId={id} />
    </div>
  );
}
